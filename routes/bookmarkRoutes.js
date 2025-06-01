const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { toggleBookmark, getMyBookmarks } = require("../controllers/bookmarkController");

router.post("/", auth, toggleBookmark);
router.get("/", auth, getMyBookmarks);

module.exports = router;
