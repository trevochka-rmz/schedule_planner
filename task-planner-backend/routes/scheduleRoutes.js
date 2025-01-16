const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();
const {
    addLessonToSchedule,
    allLesson,
    getScheduleByTeacher,
    updateLessonStatus,
    deleteLesson,
    updateLesson,
    getLessonById,
} = require('../controllers/scheduleController');
const {
    validateLesson,
    handleValidationErrors,
} = require('../utils/validators');

// Занятия
router.post(
    '/create',
    validateLesson,
    handleValidationErrors,
    addLessonToSchedule
);
router.get('/all', allLesson);
router.get('/lessons/:lessonId', getLessonById);
router.delete('/lessons/:lessonId', deleteLesson);
router.patch('/lessons/:lessonId/status', updateLessonStatus);
router.patch('/lessons/:lessonId', updateLesson);

// Расписание
router.get('/teacher/:teacherId', getScheduleByTeacher);
router.get('/teacher/:teacherId', verifyToken, getScheduleByTeacher);

module.exports = router;
