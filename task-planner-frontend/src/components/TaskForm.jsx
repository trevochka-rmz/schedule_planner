import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Modal from 'react-modal';
import { notifySuccess, notifyError } from '../../utils/notification.js';

const TaskForm = ({ onTaskAdded, isOpen, onClose, userId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [deadline, setDeadline] = useState('');
    const [assignee, setAssignee] = useState("{ value: userId, label: 'Вы' }"); // По умолчанию текущий пользователь
    const [client, setClient] = useState(null);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [error, setError] = useState(null);

    // Загрузка списка пользователей
    useEffect(() => {
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

                if (!response.ok) {
                    throw new Error('Ошибка загрузки списка пользователей');
                }

                const data = await response.json();
                // Преобразуем пользователей в формат, который понимает react-select
                const userOptions = data.users.map((user) => ({
                    value: user._id,
                    label: user.fullname,
                }));
                setUsers(userOptions);
            } catch (error) {
                console.error('Ошибка загрузки пользователей:', error);
            } finally {
                setLoadingUsers(false);
            }
        };

        if (isOpen) {
            fetchUsers(); // Загружаем пользователей только если модалка открыта
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Сбрасываем предыдущие ошибки

        try {
            console.log(client, userId);
            const response = await fetch(
                'http://localhost:5000/api/task/create',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem(
                            'token'
                        )}`,
                    },
                    body: JSON.stringify({
                        creator: userId, // Передаем ID текущего пользователя
                        title,
                        description,
                        priority,
                        deadline,
                        assignee: client ? client.value : null,
                    }),
                }
            );

            if (response.ok) {
                setTitle('');
                setDescription('');
                setPriority('medium');
                setDeadline('');
                setClient(null);
                setAssignee({ value: userId, label: 'Вы' });
                onTaskAdded();
                onClose();
                notifySuccess('Задача успешно добавлена');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Не удалось добавить задачу');
                notifyError('Не удалось добавить задачу');
            }
        } catch (error) {
            console.error('Ошибка при добавлении задачи:', error);
            setError('Произошла ошибка. Повторите попытку позже.');
            notifyError('Произошла ошибка. Повторите попытку позже.');
        }
    };

    if (!isOpen) return null; // Если модалка закрыта, ничего не рендерим

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="add-regular-lesson-modal"
            overlayClassName="add-regular-lesson-overlay"
        >
            {error && <p className="error-message">{error}</p>}
            <h2>Создать задачу</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Название задачи:</label>
                    <input
                        type="text"
                        placeholder="Введите задачу"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Исполнитель:</label>
                    <Select
                        options={users}
                        value={assignee}
                        onChange={(selectedOption) =>
                            setAssignee(selectedOption)
                        }
                        isLoading={loadingUsers}
                        placeholder="Выберите исполнителя"
                        isDisabled
                    />
                </div>
                <div>
                    <label>Клиент:</label>
                    <Select
                        options={users}
                        value={client}
                        onChange={(selectedOption) => setClient(selectedOption)}
                        isLoading={loadingUsers}
                        placeholder="Выберите клиента"
                        isClearable
                    />
                </div>
                <div>
                    <label>Описание:</label>
                    <textarea
                        placeholder="Введите описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label>Важность:</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="low">Низкий</option>
                        <option value="medium">Средний</option>
                        <option value="high">Высокий</option>
                        <option value="critical">Критический</option>
                    </select>
                </div>
                <div>
                    <label>Выберите дедлайн:</label>
                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </div>

                <div className="modal-buttons">
                    <button type="submit">Добавить</button>
                    <button type="button" onClick={onClose}>
                        Отмена
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskForm;
