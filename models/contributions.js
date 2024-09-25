const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const { Schema } = mongoose;

const ContributionsSchema = new Schema(
  {
    date: { type: Date, default: Date.now, required: true },
    numberOfContributions: { type: Number, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      onDelete: "cascade",
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

ContributionsSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});
module.exports = mongoose.model("Contributions", ContributionsSchema);
