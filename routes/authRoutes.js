const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { validateBody } = require("../middlewares/validateBody");
const { authRegisterSchema, authLoginSchema } = require("../validation/schemas");

router.post("/register", validateBody(authRegisterSchema), register);
router.post("/login", validateBody(authLoginSchema), login);

module.exports = router;