const express = require('express');
const router = express.Router();
const regularLessonsController = require('../controllers/regularLessonsController');
const regularGroupLessonsController = require('../controllers/regularGroupLessonsController');

// Методы для регулярных занятий Lesson
router.post('/create', regularLessonsController.addRegularLesson);
router.delete(
    '/delete/:id',

    regularLessonsController.deleteRegularLesson
);
router.patch('/update/:id', regularLessonsController.updateRegularLesson);

// Методы для регулярных занятий GroupLesson
router.post(
    '/create-group',

    regularGroupLessonsController.addRegularGroupLesson
);
router.delete(
    '/delete-group/:id',
    regularGroupLessonsController.deleteRegularGroupLesson
);

// Получения всех регулярных занятий Lesson
router.get('/all', regularLessonsController.getAllRefularLesson);
router.get(
    '/regular-lessons/:studentId',
    regularLessonsController.getRegularLessonByStudentId
);

// Получения всех регулярных занятий GroupLesson
router.get(
    '/all-group',
    regularGroupLessonsController.getAllRegularGroupLessons
);
router.get(
    '/regular-group/:groupId',
    regularGroupLessonsController.getRegularGroupLessonByGroupId
);

module.exports = router;
