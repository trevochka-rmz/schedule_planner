import React from 'react';
import { notifySuccess, notifyError } from '../../utils/notification.js';
const TaskItem = ({ task, onUpdate, users, userIdTeacher }) => {
    // Функция для получения полного имени пользователя по userId
    const getUserFullName = (userId) => {
        if (!users || users.length === 0) {
            return 'Загрузка...'; // Если список пользователей еще не загружен
        }

        const user = users.find((user) => user._id === userId);
        return user ? user.fullname : 'Неизвестный пользователь';
    };

    const changeStatus = async (newStatus) => {
        try {
            await fetch(`http://localhost:5000/api/task/status/${task._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            onUpdate();
            notifySuccess('Статус задачи успешно изменен');
        } catch (error) {
            notifyError('Ошибка изменения статуса');
            console.error('Ошибка изменения статуса:', error);
        }
    };

    const deleteTask = async () => {
        try {
            await fetch(`http://localhost:5000/api/task/delete/${task._id}`, {
                method: 'DELETE',
            });
            onUpdate();
            notifySuccess('Задача успешно удалена');
        } catch (error) {
            notifyError('Ошибка удалении задачи, попробуйте позже');
            console.error('Ошибка удаления задачи:', error);
        }
    };

    return (
        <div className="task-item">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Исполнитель: {getUserFullName(task.creator)}</p>
            <p>Клиент: {getUserFullName(task.assignee)}</p>
            <p>Приоритет: {task.priority}</p>
            <p>Статус: {task.status}</p>
            {task.status === 'completed' && task.assignee === userIdTeacher ? (
                <button onClick={() => changeStatus('pending')}>Вернуть</button>
            ) : task.status === 'pending' && task.assignee === userIdTeacher ? (
                <button onClick={() => changeStatus('completed')}>
                    Завершить
                </button>
            ) : null}
            <button onClick={deleteTask} className="delete">
                Удалить
            </button>
        </div>
    );
};

export default TaskItem;
