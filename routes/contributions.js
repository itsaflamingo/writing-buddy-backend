const express = require("express");

const router = express.Router();

const contributions_controller = require("../controllers/contributionsController");

router.get(
  "/:user_id/contributions",
  contributions_controller.user_contributions
);

module.exports = router;
