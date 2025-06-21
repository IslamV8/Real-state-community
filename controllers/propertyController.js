const Property = require("../models/Property");
const cloudinary = require("../config/cloudinary");


exports.createProperty = async (req, res) => {
  try {
    const newProperty = new Property({
      ...req.body,
      createdBy: req.user.userId
    });

    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (err) {
    console.error("🚨 Property creation error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllProperties = async (req, res) => {
  try {

    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip  = (page - 1) * limit;


    const query = {};
    if (req.query.state)    query.state    = req.query.state;
    if (req.query.city)     query.city     = req.query.city;
    if (req.query.type)     query.type     = req.query.type;
    if (req.query.forSale !== undefined) {
      query.forSale = req.query.forSale === "true";
    }
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }


    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate("createdBy", "username displayName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Property.countDocuments(query)
    ]);


    const totalPages = Math.ceil(total / limit);

 
    res.status(200).json({
      page,
      totalPages,
      totalItems: properties.length,
      totalProperties: total,
      properties
    });
  } catch (err) {
    console.error("🚨 getAllProperties Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getSingleProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("createdBy", "username displayName");
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.status(200).json(property);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    if (
      property.createdBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }


    if (req.body.title) property.title = req.body.title;
    if (req.body.description) property.description = req.body.description;
    if (req.body.price !== undefined) property.price = req.body.price;
    if (req.body.city) property.city = req.body.city;
    if (req.body.state) property.state = req.body.state;
    if (req.body.type) property.type = req.body.type;
    if (req.body.forSale !== undefined) property.forSale = req.body.forSale;
    if (req.body.images) property.images = req.body.images;

    await property.save();
    res.status(200).json(property);
  } catch (err) {
    console.error("🚨 Update Property Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    if (
      property.createdBy.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await property.deleteOne();
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    const urls = req.files.map(f => f.path);
    
    property.images = property.images.concat(urls);
    await property.save();
    res.status(200).json(property);
  } catch (err) {
    console.error("🚨 uploadImages Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};