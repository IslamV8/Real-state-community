const Bookmark = require("../models/Bookmark");

exports.toggleBookmark = async (req, res) => {
    const { propertyId } = req.body;
    const userId = req.user.userId;

    try {
        const existing = await Bookmark.findOne({ user: userId, property: propertyId });

        if (existing) {
            await existing.deleteOne();
            return res.status(200).json({ message: "Removed from bookmarks" });
        }

        const newBookmark = new Bookmark({ user: userId, property: propertyId });
        await newBookmark.save();
        res.status(201).json({ message: "Added to bookmarks" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.getMyBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ user: req.user.userId })
            .populate("property");

        res.status(200).json(bookmarks);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
