const mongoose = require("mongoose");

const { Schema } = mongoose;

const ContributionsSchema = new Schema({
  date: { type: Date, default: Date.now, required: true },
  numberOfContributions: { type: Number, required: true },
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
    onDelete: "cascade",
  },
});

module.exports = mongoose.model("Contributions", ContributionsSchema);
