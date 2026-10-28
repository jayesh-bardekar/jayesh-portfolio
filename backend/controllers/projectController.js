const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");

// GET all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects.",
    });
  }
};

// GET project by ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch project.",
    });
  }
};

// CREATE project
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      technologies,
      liveUrl,
      githubUrl,
      image,
      imagePublicId,
      media,
    } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    let parsedTechnologies = technologies || [];
    let parsedMedia = media || [];

    if (typeof parsedTechnologies === "string") {
      parsedTechnologies = parsedTechnologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof parsedMedia === "string") {
      parsedMedia = JSON.parse(parsedMedia);
    }

    if (!Array.isArray(parsedMedia)) {
      return res.status(400).json({
        success: false,
        message: "Media must be an array.",
      });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      technologies: parsedTechnologies,
      liveUrl: liveUrl || "",
      githubUrl: githubUrl || "",
      image: image || "",
      imagePublicId: imagePublicId || "",
      media: parsedMedia,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully!",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create project.",
    });
  }
};

// UPDATE project
const updateProject = async (req, res) => {
  try {
    const {
      title,
      description,
      technologies,
      liveUrl,
      githubUrl,
      image,
      imagePublicId,
      media,
    } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (title !== undefined) project.title = title.trim();
    if (description !== undefined) {
      project.description = description.trim();
    }

    if (technologies !== undefined) {
      project.technologies =
        typeof technologies === "string"
          ? technologies
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : technologies;
    }

    if (liveUrl !== undefined) project.liveUrl = liveUrl;
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (image !== undefined) project.image = image;
    if (imagePublicId !== undefined) {
      project.imagePublicId = imagePublicId;
    }

    if (media !== undefined) {
      project.media =
        typeof media === "string" ? JSON.parse(media) : media;
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully!",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update project.",
    });
  }
};

// DELETE project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Collect Cloudinary IDs without duplicates.
    const publicIds = new Set();

    if (project.imagePublicId) {
      publicIds.add(project.imagePublicId);
    }

    for (const item of project.media || []) {
      if (item.type === "image" && item.publicId) {
        publicIds.add(item.publicId);
      }
    }

    await project.deleteOne();

    // Remove associated images from Cloudinary.
    await Promise.allSettled(
      [...publicIds].map((publicId) =>
        cloudinary.uploader.destroy(publicId)
      )
    );

    res.status(200).json({
      success: true,
      message: "Project deleted successfully!",
    });
  } catch (error) {
    console.error("Delete project error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete project.",
    });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};