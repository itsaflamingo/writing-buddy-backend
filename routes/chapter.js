const express = require("express");

const router = express.Router();

const chapter_controller = require("../controllers/chapterController");

router.get("/:chapter_id", chapter_controller.get_update_chapter);
router.patch("/:chapter_id", chapter_controller.patch_update_chapter);
router.delete("/:chapter_id", chapter_controller.delete_chapter);

module.exports = router;
