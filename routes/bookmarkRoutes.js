const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { toggleBookmark, getMyBookmarks } = require("../controllers/bookmarkController");

router.post("/", protect, toggleBookmark);
router.get("/", protect, getMyBookmarks);

module.exports = router;
