const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { validateBody } = require("../middlewares/validateBody");
const { propertySchema } = require("../validation/schemas");
const {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
  uploadImages
} = require("../controllers/propertyController");
const upload = require("../middlewares/upload");

router.get("/", getAllProperties);
router.get("/:id", getSingleProperty);
router.post("/", protect, validateBody(propertySchema), createProperty);
router.put("/:id", protect, validateBody(propertySchema), updateProperty);
router.delete("/:id", protect, deleteProperty);
router.post("/:id/images", protect, upload.array("images", 5), uploadImages);

module.exports = router;