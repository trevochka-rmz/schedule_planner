import React, { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import './TasksPage.css';

const TasksPage = ({ teacherId, role }) => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Получение задач
    const fetchTasks = async () => {
        setLoading(true);
        try {
            let url = `http://localhost:5000/api/task/teacher/${teacherId}`;
            if (role === 'manager') {
                url = 'http://localhost:5000/api/task/all';
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки задач');
            }

            const data = await response.json();

            // Проверяем, что data — массив. Если нет, устанавливаем пустой массив.
            if (Array.isArray(data)) {
                setTasks(data);
            } else {
                console.warn('Сервер вернул некорректные данные:', data);
                setTasks([]); // Если данные не массив, устанавливаем пустой массив.
            }
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
            setTasks([]); // В случае ошибки устанавливаем пустой массив.
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(
                'http://localhost:5000/api/users/teacher-manager',
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            'token'
                        )}`,
                    },
                }
            );
            const result = await response.json();
            // console.log(result); // Смотрим, что приходит в ответе
            setUsers(result.users); // Используем result.users для установки состояния
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchUsers();
        // console.log(users);
    }, [teacherId, role]);

    return (
        <div className="tasks-container">
            <h1 className="tasks-title">Управление задачами</h1>
            <button className="add-user-button" onClick={handleOpenModal}>
                Добавить задачу
            </button>
            <TaskForm
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onTaskAdded={fetchTasks}
                userId={teacherId} // Передаем id текущего пользователя
            />
            {loading ? (
                <p>Загрузка...</p>
            ) : (
                <TaskList
                    tasks={tasks}
                    users={users}
                    userId={teacherId}
                    onUpdate={fetchTasks}
                />
            )}
        </div>
    );
};

export default TasksPage;
