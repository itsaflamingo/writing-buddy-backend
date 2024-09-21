const mongoose = require("mongoose");

const { Schema } = mongoose;

const ContributionsSchema = new Schema({
  date: { type: Date, default: Date.now, required: true },
  numberOfContributions: { type: Number, required: true },
});

module.exports = mongoose.model("Contributions", ContributionsSchema);
