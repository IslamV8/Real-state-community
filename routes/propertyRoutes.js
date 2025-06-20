const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { validateBody }   = require("../middlewares/validateBody");


const { propertySchema } = require("../validation/schemas");

const {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty
} = require("../controllers/propertyController");


router.post(  "/",  protect,  validateBody(propertySchema),  createProperty);
router.get("/", getAllProperties);
router.get("/:id", getSingleProperty);
router.put(  "/:id",  protect,  validateBody(propertySchema),  updateProperty);
router.delete("/:id", protect, deleteProperty);

module.exports = router;
