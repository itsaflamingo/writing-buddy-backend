// Import schema, express-validator
const { body, validationResult } = require('express-validator');
const async = require('async');
const Project = require('../models/project');
const User = require('../models/user');
// Get all projects
exports.projects_list = (req, res, next) => {
  Project.find({ user: req.params.id }, 'title genre isComplete date isPublished')
    .populate({
      path: 'user',
      model: 'User',
    })
    .sort({ date: -1 })
    .exec()
    .then((result) => res.json(result))
    .catch((err) => next(err));
};
// Post new project
exports.create_project = [
  // Sanitize and trim
  body('title', 'Title must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    // Extract validation errors from request
    const errors = validationResult(req);

    User.findById(req.params.id)
      .exec()
      .then((user) => {
        // Handle errors - if errors array is not empty
        if (!errors.isEmpty()) {
          console.log(errors);
          // Return error
          return errors;
        }

        if (!user) {
          const err = new Error('User not found');
          err.status = 404;
          return next(err);
        }
        // Create new project with sanitized data
        const project = new Project({
          title: req.body.title,
          genre: req.body.genre,
          isComplete: req.body.isComplete,
          isPublished: req.body.isPublished,
          user: user._id,
        });
        // Data from form is valid, save blog post
        project.save()
          .then((results) => res.json({
            title: results.title,
            genre: results.genre,
            isComplete: results.isComplete,
            isPublished: results.isPublished,
            id: results._id,
            date_formatted: results.date_formatted,
          }))
          .catch((err) => err);
        return project;
      })
      .catch((err) => err);
  }];
// Get project to update
exports.get_update_project = (req, res, next) => {
  async.waterfall(
    [
    // Get selected project by id in parameter
      function (callback) {
        Project.findById(req.params.project_id)
          .then((project) => callback(null, project))
          .catch((err) => callback(err));
      },
      // Error handler function
      function (project, callback) {
        if (project === null) {
          const err = new Error('Project not found');
          err.status = 404;
          return callback(err);
        }
        callback(null, project);
      },
    // Send relevant project in response
    ],
    (err, results) => {
      if (err) return next(err);
      return res.json({
        title: results.title,
        genre: results.genre,
        isComplete: results.isComplete,
        isPublished: results.isPublished,
        user: results.user,
        date_formatted: results.date_formatted,
      });
    },
  );
};
exports.patch_update_project = [
  // Sanitize and validate
  body('title', 'Title must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error('Project not found');
      error.status = 404;
      return next(error);
    }

    return Project.findOneAndUpdate({ _id: req.params.project_id }, {
      $set: {
        title: req.body.title,
        genre: req.body.genre,
        isComplete: req.body.isComplete,
        isPublished: req.body.isPublished,
        _id: req.params.project_id,
      },
    }, { new: true })
      .then((project) => {
        // if project cannot be found, return error
        if (!project) {
          return res.status(404).json({ message: 'Project not found' });
        }
        // else, return response with project data
        return res.json({
          title: project.title,
          genre: project.genre,
          isComplete: project.isComplete,
          isPublished: project.isPublished,
          date: project.date,
          user: project.user,
          date_formatted: project.date_formatted,
        });
      })
      .catch((err) => next(err));
  },
];
// Delete single project
exports.delete_project = (req, res, next) => {
  Project.findByIdAndDelete(req.params.project_id)
    .then((project) => {
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      return res.json({ message: 'Project deleted successfully' });
    })
    .catch((err) => next(err));
};
