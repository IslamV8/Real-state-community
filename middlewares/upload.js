const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer               = require("multer");
const cloudinary           = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "real-estate",         
    allowed_formats: ["jpg","jpeg","png"],
    transformation: [{ width: 800, height: 600, crop: "limit" }]
  }
});

module.exports = multer({ storage });