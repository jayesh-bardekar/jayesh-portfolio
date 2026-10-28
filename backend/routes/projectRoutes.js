const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

// Public routes: Anyone can view projects
router.get("/", getProjects);
router.get("/:id", getProjectById);

// Protected routes: Only authenticated admin
router.post("/", protect, createProject);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);

module.exports = router;