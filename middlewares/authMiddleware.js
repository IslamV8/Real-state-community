const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer "))
    return res.status(401).json({ error: "Authentication required" });
  const token = h.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

exports.protect = protect;
