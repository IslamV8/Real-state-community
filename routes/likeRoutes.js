const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { toggleLike, getLikesForProperty } = require("../controllers/likeController");

router.post("/", auth, toggleLike);
router.get("/property/:propertyId", getLikesForProperty);

module.exports = router;