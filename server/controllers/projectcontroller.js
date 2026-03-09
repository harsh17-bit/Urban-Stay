const mongoose = require("mongoose");
const Project = require("../models/project");

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res) => {
  try {
    const { city, status, featured } = req.query;
    let query = {};

    if (city) query["location.city"] = new RegExp(city, "i");
    if (status) query.status = status;
    if (featured) query.isFeatured = featured === "true";

    const projects = await Project.find(query).sort("-createdAt");

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching projects",
      error: error.message,
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { slug: req.params.id },
      ],
    }).populate("developer", "name email companyName phone");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching project",
      error: error.message,
    });
  }
};
