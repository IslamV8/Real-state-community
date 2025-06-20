const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { toggleLike, getLikesForProperty } = require("../controllers/likeController");

router.post("/", protect, toggleLike);
router.get("/property/:propertyId", getLikesForProperty);

module.exports = router;