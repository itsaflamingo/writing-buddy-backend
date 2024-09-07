// Import schema, express-validator
const { body, validationResult } = require("express-validator");
const async = require("async");
const Project = require("../models/project");
const Act = require("../models/act");
// Get all acts
exports.acts_list = (req, res, next) => {
  // Filter acts that belong to a project
  Act.find(
    { project: req.params.project_id },
    "title genre isComplete date isPublished"
  )
    .populate({
      path: "project",
      model: "Project",
    })
    .sort({ date: -1 })
    .exec()
    .then((result) => res.json(result))
    .catch((err) => next(err));
};
// Post new act
exports.create_act = [
  // Sanitize and trim
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    // Extract validation errors from request
    const errors = validationResult(req);

    // Get project that act will be added to
    Project.findById(req.params.project_id)
      .exec()
      .then((project) => {
        // Handle errors - if errors array is not empty
        if (!errors.isEmpty()) {
          // Return error
          return errors;
        }

        if (!project) {
          const err = new Error("Project not found");
          err.status = 404;
          return next(err);
        }
        // Create new project with sanitized data, add project field & project id
        const act = new Act({
          title: req.body.title,
          isComplete: req.body.isComplete,
          isPublished: req.body.isPublished,
          project: project._id,
        });
        // Data from form is valid, save blog post
        act
          .save()
          .then((results) => {
            res.json({
              title: results.title,
              isComplete: results.isComplete,
              isPublished: results.isPublished,
              id: results._id,
              date_formatted: results.date_formatted,
            });
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  },
];
// Get request for patch
exports.get_update_act = (req, res, next) => {
  // Async functions that execute sequentially
  async.waterfall(
    [
      function (callback) {
        // Get selected project by id in parameter
        Act.findById(req.params.act_id)
          .then((act) => {
            callback(null, act);
          })
          .catch((err) => {
            callback(err);
          });
      },
      // Executed after Act.findById
      function (act, callback) {
        if (act === null) {
          const err = new Error("Act not found");
          err.status = 404;
          return callback(err);
        }
        callback(null, act);
      },
    ],
    (err, results) => {
      if (err) return next(err);
      res.json({
        title: results.title,
        isComplete: results.isComplete,
        isPublished: results.isPublished,
        project: results.project,
        date_formatted: results.date_formatted,
      });
    }
  );
};
// Patch single act
exports.patch_update_act = [
  // Validate and sanitize fields
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  // Process request
  (req, res, next) => {
    // Extract validation errors from request
    const errors = validationResult(req);

    // If errors array is not empty, handle error
    if (!errors.isEmpty()) {
      const err = new Error("Act not found");
      err.status = 404;
      return next(err);
    }
    // Otherwise save updated post and update record
    Act.findOneAndUpdate(
      { _id: req.params.act_id },
      {
        $set: {
          title: req.body.title,
          isComplete: req.body.isComplete,
          isPublished: req.body.isPublished,
          _id: req.params.act_id,
        },
      },
      { new: true }
    )
      .then((act) => {
        // blog post not found
        if (!act) {
          return res.status(404).json({ message: "Act not found" });
        }
        // add virtuals to response
        const actWithVirtuals = act.toJSON({ virtuals: true });
        // else, return response with data
        return res.json(actWithVirtuals);
      })
      .catch((err) => next(err));
  },
];
// Delete single act
exports.delete_act = (req, res, next) => {
  Act.findByIdAndDelete(req.params.act_id)
    .then((act) => {
      if (!act) {
        return res.status(404).json({ message: "Act not found" });
      }
      return res.json({ message: "Act deleted successfully" });
    })
    .catch((err) => next(err));
};
