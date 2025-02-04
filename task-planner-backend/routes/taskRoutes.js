const express = require('express');
const taskController = require('../controllers/taskController');
const router = express.Router();

// Методы для задач
router.post('/create', taskController.createTask);
router.patch('/update/:taskId', taskController.updateTask);
router.delete('/delete/:taskId', taskController.deleteTask);
router.patch('/status/:taskId', taskController.changeStatusTask);

//Получения задач
router.get('/all', taskController.getAllTasks);
router.get('/teacher/:teacherId', taskController.getTasksTeacherId);
router.get(
    '/teacher/:teacherId/completed',

    taskController.getTasksCompletedTeacherId
);
router.get(
    '/teacher/:teacherId/pending',

    taskController.getTasksPendingTeacherId
);

module.exports = router;
