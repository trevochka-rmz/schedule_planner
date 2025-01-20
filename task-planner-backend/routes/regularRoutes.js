const express = require('express');
const router = express.Router();
const {
    addRegularLesson,
    deleteRegularLesson,
    updateRegularLesson,
    getAllRefularLesson,
} = require('../controllers/regularLessonsController');

router.post('/create', addRegularLesson);
router.get('/delete/:id', deleteRegularLesson);
router.patch('/update/:id', updateRegularLesson);

// Получения всех регулярных занятий
router.get('/all', getAllRefularLesson);
router.get('/regular-lessons/:id', getAllRefularLesson);

module.exports = router;
