// Import schema, express-validator
const { body, validationResult } = require('express-validator');
const Project = require('../models/project');
const Act = require('../models/act');
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