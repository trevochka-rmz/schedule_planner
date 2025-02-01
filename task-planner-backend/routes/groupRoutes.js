const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const groupLessonController = require('../controllers/groupLessonController');

// Методы группы
router.post('/create', groupController.createGroup);
router.put('/update/:id', groupController.updateGroup);
router.delete('/delete/:id', groupController.deleteGroup);

// методы для студентов группы
router.post(
    '/add/:groupId/students/:studentId',
    groupController.addStudentToGroup
);
router.delete(
    '/delete/:groupId/students/:studentId',
    groupController.removeStudentFromGroup
);

//Получения информации про группу
router.get('/groups-pagination', groupController.getAllGroupPages);
router.get('/groups', groupController.getGroups);

router.get('/get-info/:id', groupController.getGroupById);

module.exports = router;
