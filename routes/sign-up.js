const express = require("express");

const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");

router.post("/", async (req, res, next) => {
  try {
    // Create new user, save result to user object
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      admin: req.body.admin,
    });

    // Create bashed password, replace user.password
    bcrypt.hash("somePassword", 10, async (err, hashedPassword) => {
      // if err, do something
      if (err) {
        next(err);
      }
      // otherwise, store hashedPassword in DB
      user.password = hashedPassword;
      const result = await user.save();
      res.json(result);
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
