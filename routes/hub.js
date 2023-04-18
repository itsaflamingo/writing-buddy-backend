var express = require('express');
var router = express.Router();

const project_controller = require('../controllers/projectController');
const act_controller     = require('../controllers/actController'    );
const chapter_controller = require('../controllers/chapterController');
/* GET home page. */
router.get ('/', project_controller.projects_list );
router.post('/user/:id/project/create', project_controller.create_project);
router.post('/project/:project_id/act/create', act_controller.create_act);
router.post('/act/:act_id/chapter/create', chapter_controller.create_chapter);

module.exports = router;
