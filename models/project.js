const mongoose = require('mongoose');
const he = require('he');
const { formatDate } = require('../methods/formatDate');

const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    title:      { type: String,  required: true                            },
    genre:      { type: String                                             },
    isComplete: { type: Boolean, required: true                            },
    user:       { type: Schema.Types.ObjectId, ref: 'user', required: true },
    date:       { type: Date, default: Date.now, required: true            }
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

module.exports = mongoose.model("Project", ProjectSchema);


