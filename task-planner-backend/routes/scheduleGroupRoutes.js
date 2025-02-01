const express = require('express');
const router = express.Router();
const groupLessonController = require('../controllers/groupLessonController');

// Методы для груповых занятий
router.post('/create', groupLessonController.createGroupLesson);

module.exports = router;
