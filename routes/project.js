const express = require("express");

const router = express.Router();

const project_controller = require("../controllers/projectController");
const act_controller = require("../controllers/actController");

// PROJECT
router.get("/:project_id", project_controller.get_update_project);
router.patch("/:project_id/update", project_controller.patch_update_project);
router.delete("/:project_id/delete", project_controller.delete_project);

// ACT
router.get("/:project_id/acts", act_controller.acts_list);
router.post("/:project_id/act/create", act_controller.create_act);

module.exports = router;
