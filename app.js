const express = require("express");
const cors = require("cors");
const app = express();


app.use(express.json());
app.use(cors());


const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const commentRoutes = require("./routes/commentRoutes");
const likeRoutes = require("./routes/likeRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require("./routes/messageRoutes");


app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);


const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);


//tennis route
app.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

module.exports = app;
