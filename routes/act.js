const express = require("express");

const router = express.Router();

const act_controller = require("../controllers/actController");
const chapter_controller = require("../controllers/chapterController");

// ACT
router.delete("/:act_id", act_controller.delete_act);
router.get("/:act_id", act_controller.get_update_act);
router.patch("/:act_id", act_controller.patch_update_act);

// CHAPTER
router.get("/:act_id/chapters", chapter_controller.chapters_list);
router.post("/:act_id", chapter_controller.create_chapter);

module.exports = router;
