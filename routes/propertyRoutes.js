const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty
} = require("../controllers/propertyController");

router.post("/", auth, createProperty);
router.get("/", getAllProperties);
router.get("/:id", getSingleProperty);
router.put("/:id", auth, updateProperty);
router.delete("/:id", auth, deleteProperty);

module.exports = router;
