const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { messageSchema } = require("../validation/schemas");
const {
  sendMessage,
  getMessagesBetweenUsers,
  deleteMessageForUser
} = require("../controllers/messageController");

router.post("/", protect, validateBody(messageSchema), sendMessage);
router.get("/:withUserId", protect, getMessagesBetweenUsers);
router.delete("/:id", protect, deleteMessageForUser);

module.exports = router;