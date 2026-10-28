const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
createContact,
getContacts,
markContactRead,
} = require("../controllers/contactController");

// Public route: submit contact form and send email
router.post("/", createContact);

// Protected routes: admin only
router.get("/", protect, getContacts);
router.patch("/:id/read", protect, markContactRead);

module.exports = router;
