const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { commentSchema } = require("../validation/schemas");
const {
  createComment,
  getCommentsForProperty,
  updateComment,
  deleteComment
} = require("../controllers/commentController");

router.post("/:propertyId", protect, validateBody(commentSchema), createComment);
router.get("/:propertyId", protect, getCommentsForProperty);
router.put("/:id", protect, validateBody(commentSchema), updateComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;