const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { 
    createComment,
    getCommentsForProperty,
    updateComment,
    deleteComment
} = require("../controllers/commentController");

router.post("/", auth, createComment);
router.get("/property/:propertyId", getCommentsForProperty);
router.put("/:id", auth, updateComment);
router.delete("/:id", auth, deleteComment);


module.exports = router;