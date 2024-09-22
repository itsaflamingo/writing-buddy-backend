const Contributions = require("../models/contributions");

const updateContributions = async () => {
  try {
    // Get date of contribution
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Check if contribution exists today
    const existingContribution = await Contributions.findOne({ date: today });

    if (existingContribution) {
      // If it exists, increment the count
      existingContribution.numberOfContributions += 1;
      await existingContribution.save();
    } else {
      const newContribution = new Contributions({
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

module.exports = updateContributions;
