const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");
const User = require("../models/User");
const Property = require("../models/Property");
const Comment = require("../models/Comment");
const Message = require("../models/Message");

router.delete("/property/:id", protect, isAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.status(200).json({ message: "Property deleted by admin" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/users", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/users/:id/promote", protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.role = "admin";
    await user.save();
    res.status(200).json({ message: `${user.username} is now an admin.` });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/users/:id/demote", protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.role = "user";
    await user.save();
    res.status(200).json({ message: `${user.username} is now a regular user.` });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/users/:id", protect, isAdmin, async (req, res) => {
  try {
    if (req.user.userId === req.params.id) {
      return res.status(400).json({ error: "You can't delete yourself." });
    }
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ error: "User not found" });
    await userToDelete.deleteOne();
    res.status(200).json({ message: `User ${userToDelete.username} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/comment/:id", protect, isAdmin, async (req, res) => {
  try {
    const c = await Comment.findById(req.params.id);
    if (!c) return res.status(404).json({ error: "Comment not found" });
    await c.deleteOne();
    res.json({ message: "Comment deleted by admin" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/message/:id", protect, isAdmin, async (req, res) => {
  try {
    const m = await Message.findById(req.params.id);
    if (!m) return res.status(404).json({ error: "Message not found" });
    await m.deleteOne();
    res.json({ message: "Message deleted by admin" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;