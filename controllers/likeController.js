const Like     = require("../models/Like");
const Property = require("../models/Property");

exports.likeProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    const prop = await Property.findById(propertyId);
    if (!prop) return res.status(404).json({ error: "Property not found" });

    
    const existing = await Like.findOne({ property: propertyId, user: req.user.userId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ liked: false });
    }

    
    const like = await new Like({
      property: propertyId,
      user: req.user.userId
    }).save();
    res.status(201).json({ liked: true, likeId: like._id });
  } catch (err) {
    console.error("🚨 likeProperty Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getLikesByProperty = async (req, res) => {
  try {
    const likes = await Like.find({ property: req.params.propertyId })
      .populate("user", "username displayName");
    res.json(likes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteLike = async (req, res) => {
  try {
    const like = await Like.findById(req.params.id);
    if (!like) return res.status(404).json({ error: "Like not found" });
    
    if (like.user.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await like.deleteOne();
    res.json({ message: "Like removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};