// Import schema, express-validator
const { body, validationResult } = require('express-validator');
const Project = require('../models/project');
const Act = require('../models/act');
const async = require('async');
// Get all projects
exports.acts_list = (req, res, next) => {
    Act.find({ project: req.params.project_id }, 'title genre isComplete date')
        .populate({
            path: 'project',
            model: 'Project'
        })
        .sort({ date: -1 })
        .exec()
            .then(result => res.json(result))
            .catch(err => next(err))   
}
// Post new project
exports.create_act = [
    // Sanitize and trim
    body('title', 'Title must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
    (req, res, next) => {
        // Extract validation errors from request
        const errors = validationResult(req);

        // Get project that act will be added to
        Project.findById(req.params.project_id)
            .exec()
            .then(project => {
                // Handle errors - if errors array is not empty
                if(!errors.isEmpty()) {
                    // Return error
                    return errors;
                }

                if(!project) {
                    const err = new Error('Project not found');
                    err.status = 404;
                    return next(err);
                }
                // Create new project with sanitized data, add project field & project id
                const act = new Act({
                    title:      req.body.title,
                    isComplete: req.body.isComplete,
                    project:    project._id
                })
                // Data from form is valid, save blog post
                act.save()
                    .then(results => {
                        res.json({
                            title:      results.title,
                            isComplete: results.isComplete,
                            id:         results._id
                        })
                    })
            .catch(err => {
                return next(err);
            })
        })
        .catch(err => {
            return next(err);
        })
}]
// Get request for patch
exports.get_update_act = (req, res, next) => {
    // Async functions that execute sequentially 
    async.waterfall([
        function (callback) {
        // Get selected project by id in parameter
          Act.findById(req.params.act_id)
            .then(act => {
            callback(null, act);
          }).catch(err => {
            callback(err);
          });
        },
        // Executed after Project.findById
        function (act, callback) {
          if (act === null) {
            const err = new Error('Act not found');
            err.status = 404;
            return callback(err);
          }
          callback(null, act);
        }
      ],
      function (err, results) {
        if (err) return next(err);
        res.json({
          title:        results.title,
          isComplete:   results.isComplete,
          project:      results.project,
          date:         results.date,
        });
      }
    )}
// Patch single project
exports.patch_update_act = [
    // Validate and sanitize fields
    body('title', 'Title must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    // Process request
    (req, res, next) => {
        // Extract validation errors from request
        const errors = validationResult(req);
        
        // If errors array is not empty, handle error
        if(!errors.isEmpty()) {
            const err = new Error('Act not found');
            err.status = 404;
            return next(err);
        }
        // Otherwise save updated post and update record
        Act.findOneAndUpdate({ _id: req.params.act_id }, { $set: {
            title:      req.body.title, 
            isComplete: req.body.isComplete, 
            _id:        req.params.act_id 
        }}, { new: true })
            .then(act => {
                // blog post not found
                if(!act) {
                    return res.status(404).json({ message: 'Act not found' });
                }
                // Successful: send updated book as json object
                res.json({
                    title:      act.title,
                    isComplete: act.isComplete,
                    project:    act.project,
                    date:       act.date,
                    _id:        act._id
                })
            })
            .catch(err => next(err))
    }]
// Delete single act
exports.delete_act = (req, res, next) => {
    Act.findByIdAndDelete(req.params.act_id)
        .then(act => {
            if(!act) {
                return res.status(404).json({ message: 'Act not found' });
            }
            res.json({ message: 'Act deleted successfully' });
        })
        .catch(err => next(err));
}