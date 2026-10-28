const express = require("express");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadImage,
  uploadMultipleImages,
} = require("../controllers/uploadController");

const router = express.Router();

// Upload one cover image.
router.post("/", protect, upload.single("image"), uploadImage);

// Upload multiple gallery images.
router.post(
  "/multiple",
  protect,
  upload.array("images", 10),
  uploadMultipleImages
);

module.exports = router;