const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      // Send error if there is an error or user is not defined
      if (err || !user) {
        const error = new Error("An error occurred.");

        return next(error);
      }

      req.login(user, { session: false }, async (error) => {
        const body = {
          _id: user._id,
          username: user.username,
          profileInfo: user.profileInfo,
        };
        // create token using jsonwebtoken, sets expiry time
        // jwt.sign(payload, secretOrPrivateKey, [options, callback])
        const token = jwt.sign({ user: body }, process.env.SECRET_KEY, {
          expiresIn: "7d",
        });

        return res.set("Authorization", `Bearer ${token}`).json({
          user: body,
          token,
        });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

module.exports = router;
