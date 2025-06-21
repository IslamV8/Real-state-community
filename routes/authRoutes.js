const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
const { validateBody } = require("../middlewares/validateBody");
const {
  authRegisterSchema,
  authLoginSchema,
} = require("../validation/schemas");
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", validateBody(authRegisterSchema), register);
router.post("/login", validateBody(authLoginSchema), login);
router.post("/logout", protect, logout);

module.exports = router;
