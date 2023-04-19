const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const Project = require('../models/project');
const Act = require('../models/act')
const Chapter = require('../models/chapter')


const UserSchema = new Schema({
    username: { type: String,  required: true  },
    password: { type: String,  required: true  },
    admin:    { type: Boolean, required: true  }
});
// Save individual hashed password 
UserSchema.pre(
    'save', 
    async function(next) {
        // select schema
        let password = this.password;
        // encrypt password
        const hash = await bcrypt.hash(password, 10);
        // save to password
        password = hash;
        // next
        next()
    }
)
// Add isValidPassword to UserSchema methods, compares form password with saved password
UserSchema.methods.isValidPassword = async function(password) {
    // save this schema to user
    const userPassword = this.password;
    // compare entered password with saved passsword 
    const compare = await bcrypt.compare(password, userPassword);
    // return boolean returned by bcrypt.compare
    return compare;
}

// Middleware to remove child documents before deleting a user
UserSchema.pre('findOneAndDelete', async function (next) {
    const userId = this._conditions._id;
    
    // Find all projects associated with the user
    const projects = await Project.find({ user: userId });
  
    // Get all project ids
    const projectIds = projects.map(proj => proj._id);

    for (const projectId of projectIds) {
        // Find all acts associated with the project
        const acts = await Act.find({ project: projectId });
    
        // Get all act ids
        const actIds = acts.map(act => act._id);
    
        // Delete all chapters associated with the acts
        await Chapter.deleteMany({ act: { $in: actIds } });
    
        // Delete all acts associated with the project
        await Act.deleteMany({ project: projectId });
      }
    // Delete all acts associated with the project
    await Project.deleteMany({ user: userId });
    
    next();
  });

module.exports = mongoose.model("User", UserSchema);


