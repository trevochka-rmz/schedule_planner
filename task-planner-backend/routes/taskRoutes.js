const express = require('express');
const {
    createTask,
    getAllTasks,
    deleteTask,
    updateTask,
    getTasksTeacherId,
    getTasksCompletedTeacherId,
    getTasksPendingTeacherId,
    changeStatusTask,
} = require('../controllers/taskController');

const router = express.Router();

router.post('/create', createTask);
router.patch('/update/:taskId', updateTask);
router.delete('/delete/:taskId', deleteTask);
router.patch('/status/:taskId', changeStatusTask);

//Получения задач
router.get('/all', getAllTasks);
router.get('/teacher/:teacherId', getTasksTeacherId); // Получения всех задач преподавателя
router.get('/teacher/:teacherId/completed', getTasksCompletedTeacherId);
router.get('/teacher/:teacherId/pending', getTasksPendingTeacherId);

module.exports = router;
