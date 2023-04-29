const mongoose = require('mongoose');
const he = require('he');
const { formatDate } = require('../methods/formatDate');

const { Schema } = mongoose;

const ChapterSchema = new Schema({
  title: { type: String, required: true },
  number: { type: Number, required: true },
  body: { type: String, required: true },
  isComplete: { type: Boolean, required: true },
  act: {
    type: Schema.Types.ObjectId, ref: 'act', required: true, onDelete: 'cascade',
  },
  date: { type: Date, default: Date.now, required: true },
});

ChapterSchema.path('title').set((title) => he.decode(title));
ChapterSchema.path('body').set((body) => he.decode(body));

// Format date before saving to database
ChapterSchema.pre('save', function (next) {
  this.date = formatDate(this.date);
  next();
});

// Add virtual. Use function() to access 'this'.
ChapterSchema.virtual('chapter_id').get(function () {
  return this._id;
});

// Add virtual. Use function() to access 'this'.
ChapterSchema.virtual('url').get(function () {
  return `/act/${this.act_id}/chapter/${this.chapter_id}`;
});

module.exports = mongoose.model('Chapter', ChapterSchema);
