// Import schema, express-validator
const { body, validationResult } = require('express-validator');
const async = require('async');
const Act = require('../models/act');
const Chapter = require('../models/chapter');
// Get all chapters
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
// Post new chapter
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
// Patch single chapter
exports.get_update_project = (req, res, next) => {
    // Async functions that execute sequentially 
    async.waterfall([
        function (callback) {
        // Get selected project by id in parameter
          Project.findById(req.params.id)
            .then(proj => {
            callback(null, proj);
          }).catch(err => {
            callback(err);
          });
        },
        // Executed after Project.findById
        function (project, callback) {
          if (project === null) {
            const err = new Error('Project not found');
            err.status = 404;
            return callback(err);
          }
          callback(null, project);
        }
      ],
      function (err, results) {
        if (err) return next(err);
        res.json({
          title:        results.title,
          isComplete:   results.isComplete,
          genre:        results.genre,
          user:         results.user,
          date:         results.date
        });
      }
    )}
// Patch single project
exports.patch_update_project = [
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
            const err = new Error('Porject not found');
            err.status = 404;
            return next(err);
        }
        // Otherwise save updated post and update record
        Project.findOneAndUpdate({ _id: req.params.id }, { $set: {
            title:     req.body.title, 
            genre:      req.body.genre, 
            isComplete: false, 
            _id:       req.params.id 
        }}, { new: true })
            .then(project => {
                // blog post not found
                if(!project) {
                    return res.status(404).json({ message: 'Project not found' });
                }
                // Successful: send updated book as json object
                res.json({
                    title: project.title,
                    body:  project.body,
                    date:  project.date,
                    _id:   project._id
                })
            })
            .catch(err => next(err))
    }]
// Delete single chapter