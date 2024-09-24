const Contributions = require("../models/contributions");
const User = require("../models/user");

exports.user_contributions = (req, res, next) => {
  Contributions.find({ user: req.params.id })
    .populate({
      path: "user",
      model: "User",
    })
    .sort({ date: -1 })
    .exec()
    .then((result) => res.json(result))
    .catch((err) => next(err));
};

exports.updateContributions = async (req) => {
  try {
    // Get date of contribution
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if contribution exists today
    const existingContribution = await Contributions.findOne({
      user: req.user._id, // Filter by the logged-in user's ID
      date: today, // Filter by the specific date
    });

    if (existingContribution) {
      // If it exists, increment the count
      existingContribution.numberOfContributions += 1;
      await existingContribution.save();
    } else {
      const newContribution = new Contributions({
        user: req.user._id,
        date: today,
        numberOfContributions: 1,
      });
      await newContribution.save();
    }
    // Else add contribution, update counter
  } catch (err) {
    console.error("Error updating contributions:", err);
    throw new Error("Contribution update failed");
  }
};
