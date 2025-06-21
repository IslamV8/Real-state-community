const User = require("../models/User");
const bcrypt = require("bcryptjs");

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
