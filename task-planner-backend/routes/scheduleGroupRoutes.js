const express = require('express');
const router = express.Router();
const groupLessonController = require('../controllers/groupLessonController');

// Методы для груповых занятий
router.post('/', groupLessonController.createGroupLesson);
router.put('/:id', groupLessonController.updateGroupLesson);
router.delete('/:id', groupLessonController.deleteGroupLesson);
router.patch('/:id/status', groupLessonController.updateLessonStatus);

// Методы получения
router.get('/', groupLessonController.getAllLessons);
router.get('/:id', groupLessonController.getLessonById);
router.get('/lesson/:id', groupLessonController.getGroupLessons);

module.exports = router;
