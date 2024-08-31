const mongoose = require("mongoose");
const he = require("he");
const { DateTime } = require("luxon");

const { Schema } = mongoose;

const ChapterSchema = new Schema(
  {
    title: { type: String, required: true },
    number: { type: Number, required: true },
    body: { type: String, required: true },
    isPublished: { type: Boolean, default: false, required: true },
    isComplete: { type: Boolean, required: true },
    act: {
      type: Schema.Types.ObjectId,
      ref: "act",
      required: true,
      onDelete: "cascade",
    },
    date: { type: Date, default: Date.now, required: true },
  },
  {
    // Turns virtuals into JSON that is added to the results object later
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
// Decodes HTML encoded characters
ChapterSchema.path("title").set((title) => he.decode(title));
ChapterSchema.path("body").set((body) => he.decode(body));

// Add virtual. Use function() to access 'this'.
ChapterSchema.virtual("chapter_id").get(function () {
  return this._id;
});

// Add virtual. Use function() to access 'this'.
ChapterSchema.virtual("url").get(function () {
  return `/${this.chapter_id}`;
});

ChapterSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model("Chapter", ChapterSchema);
