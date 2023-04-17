// Import schema, express-validator
const Project = require('../models/project');
const { body, validationResult } = require('express-validator');
const async = require('async');
const User = require('../models/user');
// Get all projects
exports.projects_list = (req, res, next) => {
    Project.find({ user: req.user._id }, 'title genre isComplete date')
        .populate({
            path: 'acts'
        })
        .sort({ date: -1 })
        .exec()
            .then(result => res.json(result))
            .catch(err => next(err))   
}
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

        console.log(req.params)
        User.findById(req.params.id)
            .exec()
            .then(user => {
                // Handle errors - if errors array is not empty
                if(!errors.isEmpty()) {
                    // Return error
                    return errors;
                }

                if(!user) {
                    const err = new Error('User not found');
                    err.status = 404;
                    return next(err);
                }
                // Create new project with sanitized data
                const project = new Project({
                    title:      req.body.title,
                    genre:      req.body.genre,
                    isComplete: req.body.isComplete,
                    user:       user._id
                })
                // Data from form is valid, save blog post
                project.save()
                    .then(results => {
                        res.json({
                            title:      results.title,
                            genre:      results.genre,
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