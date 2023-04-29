const User = require('../models/user');

// Delete single act
exports.delete_user = async (req, res, next) => {
  const userId = req.params.id;
  // Delete the user
  await User.findByIdAndDelete(userId);

  res.json({ message: 'User and associated projects deleted successfully' });
};
