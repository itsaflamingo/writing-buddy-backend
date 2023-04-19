const mongoose = require('mongoose');
const he = require('he');
const { formatDate } = require('../methods/formatDate');
const Act = require('../models/act');
const Chapter = require('../models/chapter');

const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    title:      { type: String,  required: true },
    genre:      { type: String },
    isComplete: { type: Boolean, required: true },
    user:       { type: Schema.Types.ObjectId, ref: 'user', required: true, onDelete: 'cascade' },
    date:       { type: Date, default: Date.now, required: true }
});

ProjectSchema.path('title').set((title) => he.decode(title));

// Format date before saving to database
ProjectSchema.pre('save', function(next) {
    this.date = formatDate(this.date);
    next();
})

ProjectSchema.virtual('project_id').get(function() {
    return this._id;
})

// Add virtual. Use function() to access 'this'.
ProjectSchema.virtual('url').get(function() {
    return `/hub/user/${user._id}/project/${project_id}`;
});

// Middleware to remove child documents before deleting a project
ProjectSchema.pre('findOneAndDelete', async function (next) {
    console.log(this);
    const projectId = this._conditions._id;
    
    // Find all acts associated with the project
    const acts = await Act.find({ project: projectId });
  
    // Delete all chapters associated with the acts
    const actIds = acts.map(act => act._id);
    await Chapter.deleteMany({ act: { $in: actIds } });
    // Delete all acts associated with the project
    await Act.deleteMany({ project: projectId });
    
    next();
  });

module.exports = mongoose.model("Project", ProjectSchema);


