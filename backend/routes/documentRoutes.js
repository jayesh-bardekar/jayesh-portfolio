const express = require("express");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/documentUploadMiddleware");

const {
getDocuments,
uploadDocument,
deleteDocument,
getResume,
uploadResume,
} = require("../controllers/documentController");

const router = express.Router();

// =====================================
// PUBLIC RESUME ROUTE
// =====================================

// Get latest resume (No authentication required)
router.get("/resume", getResume);

// =====================================
// ADMIN RESUME MANAGEMENT
// =====================================

// Upload / Replace Resume (Admin only)
router.post(
"/resume",
protect,
upload.single("document"),
uploadResume
);

// =====================================
// ADMIN DOCUMENT MANAGEMENT
// =====================================

// Get all documents
router.get("/", protect, getDocuments);

// Upload document
router.post(
"/",
protect,
upload.single("document"),
uploadDocument
);

// Delete document
router.delete("/:id", protect, deleteDocument);

module.exports = router;
