const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Schema } = mongoose;
const Project = require("./project");
const Act = require("./act");
const Chapter = require("./chapter");

const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    admin: { type: Boolean, required: true },
    profileInfo: {
      profilePicture: { type: String },
      bio: { type: String },
      followers: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: false,
          },
        },
      ],
      following: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: false,
          },
        },
      ],
      pinnedProjects: [
        {
          project: {
            type: Schema.Types.ObjectId,
            ref: "project",
            required: false,
          },
        },
      ],
      postingTracker: [
        {
          date: { type: Date, default: Date.now, required: false },
          month: { type: Number },
          year: { type: Number },
          contributions: [
            {
              project: {
                type: Schema.Types.ObjectId,
                ref: "project",
              },
            },
          ],
          dayContributions: { type: Number },
        },
      ],
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
// Save individual hashed password
UserSchema.pre("save", async function (next) {
  // select schema
  let { password } = this;
  // encrypt password
  const hash = await bcrypt.hash(password, 10);
  // save to password
  password = hash;
  // next
  next();
});

// Add virtual. Use function() to access 'this'.
UserSchema.virtual("user_id").get(function () {
  return this.user_id;
});

// Add virtual. Use function() to access 'this'.
UserSchema.virtual("url").get(function () {
  return `/user/${this.user_id}`;
});

UserSchema.virtual("list_projects").get(function () {
  return `/user/${this._id}/projects`;
});

// Add isValidPassword to UserSchema methods, compares form password with saved password
UserSchema.methods.isValidPassword = async function (password) {
  // save this schema to user
  const userPassword = this.password;
  // compare entered password with saved passsword
  const compare = await bcrypt.compare(password, userPassword);
  // return boolean returned by bcrypt.compare
  return compare;
};

// Middleware to remove child documents before deleting a user
UserSchema.pre("findOneAndDelete", async function (next) {
  const userId = this._conditions._id;

  // Find all projects associated with the user
  const projects = await Project.find({ user: userId });

  // Get all project ids
  const projectIds = projects.map((proj) => proj._id);

  for (const projectId of projectIds) {
    // Find all acts associated with the project
    const acts = await Act.find({ project: projectId });

    // Get all act ids
    const actIds = acts.map((act) => act._id);

    // Delete all chapters associated with the acts
    await Chapter.deleteMany({ act: { $in: actIds } });

    // Delete all acts associated with the project
    await Act.deleteMany({ project: projectId });
  }
  // Delete all projects associated with the user
  await Project.deleteMany({ user: userId });

  next();
});

module.exports = mongoose.model("User", UserSchema);
