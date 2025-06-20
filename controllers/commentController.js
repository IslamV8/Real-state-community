const Comment = require("../models/Comment");
const Joi = require("joi");

const commentSchema = Joi.object({
  content: Joi.string().required(),
  propertyId: Joi.string().required()
});

exports.createComment = async (req, res) => {
  const { error } = commentSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const comment = await new Comment({
      content: req.body.content,
      property: req.body.propertyId,
      user: req.user.userId
    }).save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getCommentsForProperty = async (req, res) => {
  try {
    const comments = await Comment.find({ property: req.params.propertyId })
      .populate("user", "username displayName");
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Not found" });
    if (comment.user.toString() !== req.user.userId)
      return res.status(403).json({ error: "Unauthorized" });
    comment.content = req.body.content || comment.content;
    await comment.save();
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Not found" });
    if (comment.user.toString() !== req.user.userId)
      return res.status(403).json({ error: "Unauthorized" });
    await comment.deleteOne();
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};