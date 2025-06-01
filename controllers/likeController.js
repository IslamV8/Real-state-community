const Like = require("../models/Like");

exports.toggleLike = async (req, res) => {
  const { propertyId } = req.body;
  const userId = req.user.userId;

  try {
    const existingLike = await Like.findOne({ user: userId, property: propertyId });

    if (existingLike) {
      await existingLike.deleteOne();
      return res.status(200).json({ message: "Like removed" });
    }

    const newLike = new Like({ user: userId, property: propertyId });
    await newLike.save();
    res.status(201).json({ message: "Like added" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getLikesForProperty = async (req, res) => {
  try {
    const likes = await Like.find({ property: req.params.propertyId }).populate("user", "username displayName");
    res.status(200).json({ count: likes.length, likes });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
