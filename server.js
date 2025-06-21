
require("dotenv").config();
require("./config/db")();
require("./config/cloudinary");

const app = require("./app");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
