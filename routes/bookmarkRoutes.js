const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { bookmarkSchema } = require("../validation/schemas");
const {
  addBookmark,
  getBookmarksForUser,
  removeBookmark
} = require("../controllers/bookmarkController");

router.post("/", protect, validateBody(bookmarkSchema), addBookmark);
router.get("/", protect, getBookmarksForUser);
router.delete("/:id", protect, removeBookmark);

module.exports = router;