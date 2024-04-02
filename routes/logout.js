const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.json({ status: 'Success' });
  });
});

module.exports = router;
