const Bookmark = require("../models/Bookmark");
const Property = require("../models/Property");

exports.addBookmark = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const prop = await Property.findById(propertyId);
    if (!prop) return res.status(404).json({ error: "Property not found" });

    
    const exists = await Bookmark.findOne({ property: propertyId, user: req.user.userId });
    if (exists) {
      return res.status(400).json({ error: "Already bookmarked" });
    }

    const bookmark = await new Bookmark({
      property: propertyId,
      user:     req.user.userId
    }).save();
    res.status(201).json(bookmark);
  } catch (err) {
    console.error("🚨 addBookmark Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getBookmarksForUser = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.userId })
      .populate("property");
    res.json(bookmarks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    if (!bookmark) return res.status(404).json({ error: "Bookmark not found" });
    if (bookmark.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await bookmark.deleteOne();
    res.json({ message: "Bookmark removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};