const mongoose = require("mongoose");
const he = require("he");
const { DateTime } = require("luxon");
const Chapter = require("./chapter");

const { Schema } = mongoose;

const ActSchema = new Schema(
  {
    title: { type: String, required: true },
    isComplete: { type: Boolean, required: true },
    project: {
      type: Schema.Types.ObjectId,
      ref: "project",
      required: true,
      onDelete: "cascade",
    },
    isPublished: { type: Boolean, default: false, required: true },
    date: { type: Date, default: Date.now, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Decodes HTML encoded characters
ActSchema.path("title").set((title) => he.decode(title));

// Add virtual. Use function() to access 'this'.
ActSchema.virtual("act_id").get(function () {
  return this._id;
});

// Add virtual. Use function() to access 'this'.
ActSchema.virtual("url").get(function () {
  return `/act/${this.act_id}`;
});

ActSchema.virtual("list_chapters").get(function () {
  return `/act/${this.act_id}/chapters`;
});

ActSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

// Middleware to remove child documents before deleting a project
ActSchema.pre("findOneAndDelete", async function (next) {
  const actId = this._conditions._id;

  // Delete all chapters associated with the project
  await Chapter.deleteMany({ act: actId });

  next();
});

module.exports = mongoose.model("Act", ActSchema);
