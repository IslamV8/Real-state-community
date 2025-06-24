const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
const { validateBody } = require("../middlewares/validateBody");
const {
  authRegisterSchema,
  authLoginSchema,
} = require("../validation/schemas");
const { protect } = require("../middlewares/authMiddleware");
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { changePassword } = require("../controllers/authController");
const Joi = require("joi");

const forgotSchema = Joi.object({ email: Joi.string().email().required() });
const resetSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

router.post("/register", validateBody(authRegisterSchema), register);
router.post("/login", validateBody(authLoginSchema), login);
router.post("/logout", protect, logout);
router.post("/forgot-password", validateBody(forgotSchema), forgotPassword);
router.post("/reset-password", validateBody(resetSchema), resetPassword);
router.post("/change-password", protect, changePassword);

module.exports = router;
