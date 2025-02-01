import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddStudentsModal.css';
import { notifySuccess, notifyError } from '../../utils/notification.js';
export default function AddStudentsModal({
    isOpen,
    onClose,
    groupId,
    groupLimit,
    onSuccess,
}) {
    const [students, setStudents] = useState([]); // Список всех студентов
    const [selectedStudents, setSelectedStudents] = useState(['']); // Поля для выбора студентов

    useEffect(() => {
        // Загружаем всех студентов
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const response = await axios.get(
                    'http://localhost:5000/api/users/students-all',
                    config
                );
                setStudents(response.data.students);
            } catch (error) {
                console.error('Ошибка загрузки списка студентов:', error);
            }
        };
        fetchStudents();
    }, []);

    // Сброс данных при повторном открытии модального окна
    useEffect(() => {
        if (isOpen) {
            setSelectedStudents(['']); // Сбрасываем выбранных студентов
        }
    }, [isOpen]);

    const handleAddField = () => {
        if (selectedStudents.length < 3) {
            setSelectedStudents((prev) => [...prev, '']);
        } else {
            notifyError(`Максимум добавлений: 3`);
        }
    };

    const handleRemoveField = (index) => {
        setSelectedStudents((prev) => prev.filter((_, i) => i !== index));
    };

    const handleChange = (index, value) => {
        const updated = [...selectedStudents];
        updated[index] = value;
        setSelectedStudents(updated);
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            // Сначала получаем текущее количество студентов в группе
            const groupResponse = await axios.get(
                `http://localhost:5000/api/group/get-info/${groupId}`,
                config
            );
            const currentStudentCount =
                groupResponse.data.group.students.length;

            // Проверяем, превышает ли количество студентов лимит
            const totalStudentsToAdd =
                currentStudentCount + selectedStudents.filter(Boolean).length;

            if (totalStudentsToAdd > groupLimit) {
                notifyError(
                    `Невозможно добавить студентов: превышен лимит группы. Лимит: ${groupLimit}, текущее количество: ${currentStudentCount}`
                );
                return;
            }

            // Отправляем запрос для каждого студента
            for (const studentId of selectedStudents) {
                if (studentId) {
                    await axios.post(
                        `http://localhost:5000/api/group/add/${groupId}/students/${studentId}`,
                        {},
                        config
                    );
                }
            }
            onSuccess(); // Вызываем функцию обновления данных
            onClose(); // Закрываем модальное окно
            notifySuccess('Успешно добавлено');
        } catch (error) {
            console.error('Ошибка при добавлении студентов:', error);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="group-modal-overlay">
            <div className="add-regular-lesson-modal">
                <h2>Добавить студентов</h2>
                {selectedStudents.map((student, index) => (
                    <div key={index} className="student-field">
                        <select
                            value={student}
                            onChange={(e) =>
                                handleChange(index, e.target.value)
                            }
                        >
                            <option value="">Выберите студента</option>
                            {students.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.fullname}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => handleRemoveField(index)}
                            className="remove-field-button"
                        >
                            Удалить поле
                        </button>
                    </div>
                ))}
                <button onClick={handleAddField} className="add-field-button">
                    Добавить еще поле
                </button>
                <div className="modal-actions-group">
                    <button
                        onClick={handleSubmit}
                        className="group-submit-button"
                    >
                        Добавить
                    </button>
                    <button onClick={onClose} className="group-cancel-button">
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
}
