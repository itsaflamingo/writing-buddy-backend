var express = require('express');
var router = express.Router();

const project_controller = require('../controllers/projectController');
const act_controller = require('../controllers/actController');
const chapter_controller = require('../controllers/chapterController');
/* GET home page. */
router.get('/', project_controller.projects_list );
router.post('/user/:id/project/create', project_controller.create_project);
// router.get('/project/:project_id/update', project_controller.get_update_project);
// router.patch('/project/:project_id/update', project_controller.patch_update_project);
router.delete('/project/:project_id/delete', project_controller.delete_project);

router.get('/project/:project_id/acts', act_controller.acts_list);
router.post('/project/:project_id/act/create', act_controller.create_act);
router.get('/act/:act_id/chapters', chapter_controller.chapters_list);
router.post('/act/:act_id/chapter/create', chapter_controller.create_chapter);

module.exports = router;
