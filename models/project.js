const mongoose = require("mongoose");
const he = require("he");
const Act = require("./act");
const Chapter = require("./chapter");
const { DateTime } = require("luxon");

const { Schema } = mongoose;

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    genre: { type: String },
    isComplete: { type: Boolean, required: true },
    isPublished: { type: Boolean, default: false, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      onDelete: "cascade",
    },
    date: { type: Date, default: Date.now, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

ProjectSchema.path("title").set((title) => he.decode(title));

ProjectSchema.virtual("project_id").get(function () {
  return this._id;
});

// Add virtual. Use function() to access 'this'.
ProjectSchema.virtual("url").get(function () {
  return `/project/${this.project_id}`;
});

ProjectSchema.virtual("list_acts").get(function () {
  return `/project/${this.project_id}/acts`;
});

ProjectSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

// Middleware to remove child documents before deleting a project
ProjectSchema.pre("findOneAndDelete", async function (next) {
  const projectId = this._conditions._id;

  // Find all acts associated with the project
  const acts = await Act.find({ project: projectId });

  // Delete all chapters associated with the acts
  const actIds = acts.map((act) => act._id);
  await Chapter.deleteMany({ act: { $in: actIds } });
  // Delete all acts associated with the project
  await Act.deleteMany({ project: projectId });

  next();
});

module.exports = mongoose.model("Project", ProjectSchema);
