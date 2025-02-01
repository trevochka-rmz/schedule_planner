const express = require('express');
const router = express.Router();
const {
    addRegularLesson,
    deleteRegularLesson,
    updateRegularLesson,
    getAllRefularLesson,
    getRegularLessonByStudentId,
} = require('../controllers/regularLessonsController');

router.post('/create', addRegularLesson);
router.delete('/delete/:id', deleteRegularLesson);
router.patch('/update/:id', updateRegularLesson);

// Получения всех регулярных занятий
router.get('/all', getAllRefularLesson);
router.get('/regular-lessons/:studentId', getRegularLessonByStudentId);

module.exports = router;
