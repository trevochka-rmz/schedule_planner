const User = require('../models/User');
const Task = require('../models/Task');

exports.createTask = async (req, res) => {
    try {
        const taskInfo = req.body;
        const newTask = await Task.create(taskInfo);
        if (!newTask) {
            res.status(400).json({
                message: 'Нет данных для создании задачи',
            });
        }
        res.status(200).json({
            message: 'Успешно создана задача',
            task: newTask,
        });
    } catch (error) {
        console.error('Ошибка сервера при создании задачи:', error);
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        if (!tasks.length) {
            res.status(400).json({
                message: 'Задач не найдено',
            });
        }
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Ошибка сервера при получении задач:', error);
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const updateTask = req.body;
        // Обновляем данные урока
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            updateTask,
            { new: true } // Возвращаем обновленный документ
        );
        if (!updatedTask) {
            return res.status(404).json({ message: 'Задача не найдена' });
        }

        res.status(200).json({
            message: 'Задача обновлёна',
            task: updatedTask,
        });
    } catch (error) {
        console.error('Ошибка сервера при изменении задач:', error);
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

//Изменения статуса
exports.changeStatusTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        if (
            !['pending', 'in_progress', 'completed', 'canceled'].includes(
                status
            )
        ) {
            return res
                .status(400)
                .json({ message: 'Недопустимый статус задачи.' });
        }

        // Обновляем задачу и добавляем дату завершения/отмены, если необходимо
        const updateFields = { status };
        if (status === 'completed') {
            updateFields.completedAt = new Date(); // Фиксируем дату завершения
            updateFields.canceledAt = null; // Сбрасываем дату отмены, если она есть
        } else if (status === 'canceled') {
            updateFields.canceledAt = new Date(); // Фиксируем дату отмены
            updateFields.completedAt = null; // Сбрасываем дату завершения
        } else {
            updateFields.completedAt = null;
            updateFields.canceledAt = null;
        }

        const task = await Task.findByIdAndUpdate(taskId, updateFields, {
            new: true,
        });

        if (!task) {
            return res.status(404).json({ message: 'Задача не найдена.' });
        }

        res.json({ message: 'Статус задачи обновлён.', task });
    } catch (error) {
        console.error('Ошибка сервера при изменении статуса задачи:', error);
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        await Task.findByIdAndDelete(taskId);

        res.status(200).json({ message: 'Задача удалена' });
    } catch (error) {
        console.error('Ошибка сервера при удалении задачи:', error);
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

// Получения задач назначенных преподавателю
exports.getTasksTeacherId = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const tasks = await Task.find({
            $or: [{ creator: teacherId }, { assignee: teacherId }],
        });
        if (!tasks.length) {
            return res.status(404).json({ message: 'Задач не найдено' });
        }
        res.status(200).json(tasks);
    } catch (error) {
        console.error(
            'Ошибка сервера при получении задач преподавателя:',
            error
        );
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

// Получения задач проведеных преподавателю
exports.getTasksCompletedTeacherId = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const tasks = await Task.find({
            assignee: teacherId,
            status: 'competed',
        });
        if (!tasks.length) {
            return res
                .status(404)
                .json({ message: 'Выполненных задач не найдено' });
        }
        res.status(200).json(tasks);
    } catch (error) {
        console.error(
            'Ошибка сервера при получении выполненных задач преподавателя:',
            error
        );
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

// Получения задач ожидаемых преподавателю
exports.getTasksPendingTeacherId = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const tasks = await Task.find({
            assignee: teacherId,
            status: { $in: ['pending', 'in_progress'] },
        });
        if (!tasks.length) {
            return res
                .status(404)
                .json({ message: 'Планируемых к выполнению задач не найдено' });
        }
        res.status(200).json(tasks);
    } catch (error) {
        console.error(
            'Ошибка сервера при получении планиируемых задач преподавателя:',
            error
        );
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};
