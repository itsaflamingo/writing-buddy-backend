// Import schema, express-validator
const { body, validationResult } = require('express-validator');
const async = require('async');
const Act = require('../models/act');
const Chapter = require('../models/chapter');
// Get all chapters
exports.chapters_list = (req, res, next) => {
  Chapter.find({ act: req.params.act_id, isPublished: true }, 'title body number isComplete act date isPublished')
    .populate({
      path: 'act',
      model: 'Act',
    })
    .sort({ number: -1 })
    .exec()
    .then((result) => res.json(result))
    .catch((err) => next(err));
};
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
      .then((act) => {
        // Handle errors - if errors array is not empty
        if (!errors.isEmpty()) {
          // Return error
          return res.status(422).json({ errors: errors.array() });
        }

        if (!act) {
          const err = new Error('Act not found');
          err.status = 404;
          return next(err);
        }
        // Create new project with sanitized data
        const chapter = new Chapter({
          title: req.body.title,
          body: req.body.body,
          number: req.body.number,
          isComplete: req.body.isComplete,
          isPublished: req.body.isPublished,
          act: act._id,
        });
        // Data from form is valid, save blog post
        chapter.save()
          .then((results) => {
            res.json({
              title: results.title,
              number: results.number,
              body: results.body,
              isComplete: results.isComplete,
              isPublished: results.isPublished,
              id: results._id,
            });
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  }];
// Patch single chapter
exports.get_update_chapter = (req, res, next) => {
  // Async functions that execute sequentially
  async.waterfall(
    [
      function (callback) {
        // Get selected project by id in parameter
        Chapter.findById(req.params.chapter_id)
          .then((chapter) => {
            callback(null, chapter);
          }).catch((err) => {
            callback(err);
          });
      },
      // Executed after Project.findById
      function (chapter, callback) {
        if (chapter === null) {
          const err = new Error('Chapter not found');
          err.status = 404;
          return callback(err);
        }
        callback(null, chapter);
      },
    ],
    (err, results) => {
      if (err) return next(err);
      return res.json({
        title: results.title,
        number: results.number,
        body: results.body,
        isComplete: results.isComplete,
        isPublished: results.isPublished,
        act: results.act,
        date: results.date,
      });
    },
  );
};
// Patch single project
exports.patch_update_chapter = [
  // Validate and sanitize fields
  body('title', 'Title must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('body', 'Body must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('number', 'Include chapter number.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  // Process request
  (req, res, next) => {
    // Extract validation errors from request
    const errors = validationResult(req);

    // If errors array is not empty, handle error
    if (!errors.isEmpty()) {
      const err = new Error('Chapter not found');
      err.status = 404;
      return next(err);
    }
    // Otherwise save updated post and update record
    Chapter.findOneAndUpdate({ _id: req.params.chapter_id }, {
      $set: {
        title: req.body.title,
        number: req.body.number,
        body: req.body.body,
        isComplete: req.body.isComplete,
        isPublished: req.body.isPublished,
        _id: req.params.id,
      },
    }, { new: true })
      .then((chapter) => {
        // blog post not found
        if (!chapter) {
          return res.status(404).json({ message: 'Chapter not found' });
        }
        // Successful: send updated book as json object
        return res.json({
          title: chapter.title,
          number: chapter.number,
          body: chapter.body,
          isComplete: chapter.isComplete,
          isPublished: chapter.isPublished,
          _id: chapter.id,
          act: chapter.act,
        });
      })
      .catch((err) => next(err));
  }];
// Delete single chapter
exports.delete_chapter = (req, res, next) => {
  Chapter.findByIdAndDelete(req.params.chapter_id)
    .then((chapter) => {
      if (!chapter) {
        return res.status(404).json({ message: 'Chapter post not found' });
      }
      return res.json({ message: 'Chapter deleted successfully' });
    })
    .catch((err) => next(err));
};
