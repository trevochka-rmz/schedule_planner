const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const lessonController = require('../controllers/lessonController');
const {
    validateLesson,
    handleValidationErrors,
} = require('../utils/validators');

// Занятия
router.post(
    '/create',
    // validateLesson,
    // handleValidationErrors,
    lessonController.addLessonToSchedule
);
router.get('/all', lessonController.allLesson);
router.get('/lessons/:lessonId', lessonController.getLessonById);
router.delete('/lessons/:lessonId', lessonController.deleteLesson);
router.patch('/lessons/:lessonId/status', lessonController.updateLessonStatus);
router.patch('/lessons/:lessonId', lessonController.updateLesson);

// Расписание
router.get('/teacher/:teacherId', scheduleController.getScheduleByTeacher);
router.get(
    '/student/:studentId',

    scheduleController.getScheduleByStudent
);
router.get('/teacherid/:userID', scheduleController.getScheduleByID);

module.exports = router;
