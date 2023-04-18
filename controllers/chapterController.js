// Import schema, express-validator
const { body, validationResult } = require('express-validator');
const async = require('async');
const Act = require('../models/act');
const Chapter = require('../models/chapter');
// Get all projects
exports.chapters_list = (req, res, next) => {
    Chapter.find({ act: req.params.act_id }, 'title body number isComplete act date')
        .populate({
            path: 'act',
            model: 'Act'
        })
        .sort({ number: -1 })
        .exec()
            .then(result => res.json(result))
            .catch(err => next(err))   
}
// Post new project
exports.create_chapter = [
    // Sanitize and trim
    body('title', 'Title must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body('body', 'Body must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body('number', 'Number must not be empty.') 
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body('isComplete', 'Check off if chapter is complete')
    .trim()
    .isLength({ min: 1 })
    .escape(),
    (req, res, next) => {
        // Extract validation errors from request
        const errors = validationResult(req);

        Act.findById(req.params.act_id)
            .exec()
            .then(act => {
                // Handle errors - if errors array is not empty
                if(!errors.isEmpty()) {
                    // Return error
                    return res.status(422).json({ errors: errors.array() });
                }

                if(!act) {
                    const err = new Error('Act not found');
                    err.status = 404;
                    return next(err);
                }
                // Create new project with sanitized data
                const chapter = new Chapter({
                    title:      req.body.title,
                    body:       req.body.body,
                    number:     req.body.number,
                    isComplete: req.body.isComplete,
                    act:        act._id
                })
                // Data from form is valid, save blog post
                chapter.save()
                    .then(results => {
                        res.json({
                            title:      results.title,
                            number:     results.number,
                            body:       results.body,
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