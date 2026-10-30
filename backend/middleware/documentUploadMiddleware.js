const multer = require("multer");
const storage = multer.memoryStorage();

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(
    new Error("Only PDF, JPG, PNG and WEBP files are allowed."),
    false
  );
};

const uploadDocument = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Maximum 10 MB
    files: 1,
  },
});

module.exports = uploadDocument;