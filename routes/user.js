const express = require("express");

const router = express.Router();

const user_controller = require("../controllers/userController");
const project_controller = require("../controllers/projectController");

// USER
router.delete("/:id", user_controller.delete_user);
router.patch("/:id", user_controller.patch_update_user);

// PROJECT
router.get("/:id/projects", project_controller.projects_list);
router.post("/:id/", project_controller.create_project);

module.exports = router;
