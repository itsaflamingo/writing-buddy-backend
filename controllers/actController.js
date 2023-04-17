// Import schema, express-validator
const { body, validationResult } = require('express-validator');
const async = require('async');
const User = require('../models/user');
const Project = require('../models/project');
const Act = require('../models/act');
// Get all projects
exports.acts_list = (req, res, next) => {
    Act.find({ project: req.project._id }, 'title genre isComplete project date')
        .populate({
            path: 'project'
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
        console.log(req.params);

        Project.findById(req.params.id)
            .exec()
            .then(project => {
                // Handle errors - if errors array is not empty
                if(!errors.isEmpty()) {
                    // Return error
                    return errors;
                }

                if(!project) {
                    const err = new Error('User not found');
                    err.status = 404;
                    return next(err);
                }
                // Create new project with sanitized data
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
// Patch single project
// Delete single project