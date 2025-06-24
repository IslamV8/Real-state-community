const express = require("express");
const session      = require("express-session");
const MongoStore   = require("connect-mongo");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || process.env.PORT,
    credentials: true,
  })
);
app.use(cookieParser());

const sessOpts = {
  name:              "sid",
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   7 * 24 * 60 * 60 * 1000
  }
};


if (process.env.NODE_ENV === "test") {
  // During Jest tests, use the built-in (in-memory) store
  app.use(session(sessOpts));
} else {
  // In development/production, persist sessions in Mongo
  app.use(session({
    ...sessOpts,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
  }));
}
// app.use(session({
//   name:     "sessionId",                     
//   secret:   process.env.SESSION_SECRET,
//   resave:   false,
//   saveUninitialized: false,
//   store:    MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
//   cookie: {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     maxAge: 7 * 24 * 60 * 60 * 1000    
//   }
// }));

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
