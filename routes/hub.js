var express = require('express');
var router = express.Router();

const project_controller = require('../controllers/projectController');
const act_controller = require('../controllers/actController');
const chapter_controller = require('../controllers/chapterController');
const user_controller = require('../controllers/userController');
/* GET home page. */
router.get('/', project_controller.projects_list );
// USER
router.delete('/user/:id/delete', user_controller.delete_user);

// PROJECT
router.post('/user/:id/project/create', project_controller.create_project);
router.delete('/project/:project_id/delete', project_controller.delete_project);

router.get('/project/:project_id', project_controller.get_update_project);
router.patch('/project/:project_id/update', project_controller.patch_update_project);

// ACT
router.get('/project/:project_id/acts', act_controller.acts_list);
router.post('/project/:project_id/act/create', act_controller.create_act);
router.delete('/act/:act_id/delete', act_controller.delete_act);
router.get('/act/:act_id', act_controller.get_update_act);
router.patch('/act/:act_id/update', act_controller.patch_update_act);
// CHAPTER
router.get('/act/:act_id/chapters', chapter_controller.chapters_list);
router.post('/act/:act_id/chapter/create', chapter_controller.create_chapter);
router.get('/chapter/:chapter_id', chapter_controller.get_update_chapter);
router.patch('/chapter/:chapter_id/update', chapter_controller.patch_update_chapter);
router.delete('/chapter/:chapter_id/delete', chapter_controller.delete_chapter);
module.exports = router;
