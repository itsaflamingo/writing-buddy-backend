const mongoose = require('mongoose');
const he = require('he');
const { formatDate } = require('../methods/formatDate');
const Chapter = require('./chapter');

const { Schema } = mongoose;

const ActSchema = new Schema({
  title: { type: String, required: true },
  isComplete: { type: Boolean, required: true },
  project: {
    type: Schema.Types.ObjectId, ref: 'project', required: true, onDelete: 'cascade',
  },
  date: { type: Date, default: Date.now, required: true },
});

ActSchema.path('title').set((title) => he.decode(title));

// Format date before saving to database
ActSchema.pre('save', function (next) {
  this.date = formatDate(this.date);
  next();
});

// Add virtual. Use function() to access 'this'.
ActSchema.virtual('act_id').get(function () {
  return this._id;
});

// Add virtual. Use function() to access 'this'.
ActSchema.virtual('url').get(function () {
  return `/hub/project/${this.project._id}/act/${this.act_id}`;
});

// Middleware to remove child documents before deleting a project
ActSchema.pre('findOneAndDelete', async function (next) {
  const actId = this._conditions._id;

  // Delete all chapters associated with the project
  await Chapter.deleteMany({ act: actId });

  next();
});

module.exports = mongoose.model('Act', ActSchema);
