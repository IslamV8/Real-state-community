const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

const { validateBody } = require("../middlewares/validateBody");

const {
  authRegisterSchema,
  authLoginSchema,
  changePassSchema
} = require("../validation/schemas");

const { protect } = require("../middlewares/authMiddleware");
const Joi = require("joi");

router.post("/register", validateBody(authRegisterSchema), register);
router.post("/login", validateBody(authLoginSchema), login);
router.post("/logout", protect, logout);

router.post(
  "/forgot-password",
  validateBody(Joi.object({ email: Joi.string().email().required() })),
  forgotPassword
);

router.post(
  "/reset-password",
  validateBody(
    Joi.object({
      token: Joi.string().required(),
      newPassword: Joi.string().min(6).required(),
    })
  ),
  resetPassword
);

router.put(
  "/change-password",
  protect,
  validateBody(changePassSchema),
  changePassword
);

module.exports = router;
