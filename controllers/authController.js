const jwt    = require("jsonwebtoken");
const User   = require("../models/User");

exports.register = async (req, res) => {
  try {
    const { username, displayName, email, password } = req.body;

 
    const exists = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    if (exists) {
      return res
        .status(400)
        .json({ error: "Username or email already in use" });
    }


    const user = new User({ username, displayName, email, password });
    await user.save();


    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    res.status(201).json({
      token,
      user: {
        id:          user._id,
        username:    user.username,
        displayName: user.displayName,
        email:       user.email,
        role:        user.role
      }
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
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

 
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }


    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    res.status(200).json({
      token,
      user: {
        id:          user._id,
        username:    user.username,
        displayName: user.displayName,
        email:       user.email,
        role:        user.role
      }
    });
  } catch (err) {
    console.error("🚨 login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};