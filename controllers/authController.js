const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

exports.register = async (req, res) => {
  try {
    const { username, displayName, email, password } = req.body;

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return res
        .status(400)
        .json({ error: "Username or email already in use" });
    }

    const user = new User({ username, displayName, email, password });
    await user.save();

    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    res.status(201).json({
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("🚨 register error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    res.json({
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("🚨 login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("🚨 logout error:", err);
      return res.status(500).json({ error: "Could not log out" });
    }

    res.clearCookie("sid");
    res.json({ message: "Logged out successfully" });
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({
      message: "If that email is in our system, you’ll receive a reset link.",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 1000 * 60 * 15;
  await user.save();

  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const message = `Click the link to reset your password (valid 15m):\n\n${resetURL}`;
  try {
    await sendEmail({
      to: user.email,
      subject: "Your password reset link",
      text: message,
    });
    res.json({ message: "Reset link sent to your email." });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    console.error("Email send error:", err);
    res.status(500).json({ error: "Could not send reset email" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ error: "Token invalid or expired" });
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: "Password has been reset successfully." });
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "Please provide all fields." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  try {
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
};
