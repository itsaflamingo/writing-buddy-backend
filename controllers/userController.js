const async = require("async");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

// Delete single act
exports.delete_user = async (req, res, next) => {
  const userId = req.params.id;
  // Delete the user
  await User.findByIdAndDelete(userId);

  res.json({ message: "User and associated projects deleted successfully" });
};

exports.patch_update_user = [
  body("username", "Username must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password", "Password must be minimum 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    return User.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          "profileInfo.profilePicture": req.body.profilePicture,
          "profileInfo.bio": req.body.bio,
        },
      },
      { new: true }
    )
      .populate(
        "profileInfo.followers.user profileInfo.following.user profileInfo.pinnedProjects.project"
      )
      .then((user) => {
        if (!errors.isEmpty()) {
          const error = new Error("User not found");
          error.status = 404;
          return next(error);
        }
        // if user can't be found, return error
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        // add virtuals to response
        const userWithVirtuals = user.toJSON({ virtuals: true });
        // else, return response with project data
        return res.json(userWithVirtuals);
      });
  },
];
