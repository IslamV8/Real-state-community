const Property = require("../models/Property");
const Joi = require("joi");

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const propertySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  type: Joi.string().valid("apartment", "house", "villa", "building", "store").required(),
  city: Joi.string().required(),
  state: Joi.string().valid(...US_STATES).required(),
  forSale: Joi.boolean().required(),
  images: Joi.array().items(Joi.string())
});

exports.createProperty = async (req, res) => {
  try {
    const { error } = propertySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

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
    const properties = await Property.find().populate("createdBy", "username displayName");
    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getSingleProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("createdBy", "username displayName");
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

    if (property.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized to edit this property" });
    }

    Object.assign(property, req.body);
    await property.save();
    res.status(200).json(property);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Property not found" });

    if (property.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized to delete this property" });
    }

    await property.deleteOne();
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
