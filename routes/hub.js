var express = require('express');
var router = express.Router();

const project_controller = require('../controllers/projectController');
const act_controller     = require('../controllers/actController'    );
/* GET home page. */
router.get ('/',                        project_controller.projects_list );
router.post('/user/:id/project/create', project_controller.create_project);
router.post('/project/:id/act/create',  act_controller.create_act        );

module.exports = router;
