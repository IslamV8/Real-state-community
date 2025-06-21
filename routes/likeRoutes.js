const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { likeSchema } = require("../validation/schemas");
const {
  likeProperty,
  getLikesByProperty,
  deleteLike
} = require("../controllers/likeController");

router.post("/", protect, validateBody(likeSchema), likeProperty);
router.get("/property/:propertyId", protect, getLikesByProperty);
router.delete("/:id", protect, deleteLike);

module.exports = router;