import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RegularLessonsList.css'; // Создайте стили для компонента

const RegularLessonsList = ({ studentId }) => {
    const [regularLessons, setRegularLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRegularLessons = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const { data } = await axios.get(
                    `http://localhost:5000/api/regular/regular-lessons/${studentId}`,
                    config
                );
                setRegularLessons(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchRegularLessons();
    }, [studentId]);

    if (loading) {
        return <p>Загрузка регулярных занятий...</p>;
    }

    if (error) {
        return <p className="error-message">Ошибка: {error}</p>;
    }

    if (regularLessons.length === 0) {
        return <p>Регулярные занятия не найдены.</p>;
    }

    return (
        <div className="regular-lessons-list">
            <h3>Регулярные занятия</h3>
            <table className="regular-lessons-table">
                <thead>
                    <tr>
                        <th>Направление</th>
                        <th>День недели</th>
                        <th>Время</th>
                        <th>Длительность</th>
                        <th>Локация</th>
                        <th>Период</th>
                    </tr>
                </thead>
                <tbody>
                    {regularLessons.map((lesson) => (
                        <tr key={lesson._id}>
                            <td>{lesson.direction}</td>
                            <td>{getDayOfWeek(lesson.dayOfWeek)}</td>
                            <td>{lesson.startTime}</td>
                            <td>{lesson.duration} минут</td>
                            <td>{lesson.location}</td>
                            <td>
                                {new Date(
                                    lesson.periodStart
                                ).toLocaleDateString()}{' '}
                                –{' '}
                                {new Date(
                                    lesson.periodEnd
                                ).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Вспомогательная функция для преобразования дня недели
const getDayOfWeek = (dayNumber) => {
    const days = [
        'Воскресенье',
        'Понедельник',
        'Вторник',
        'Среда',
        'Четверг',
        'Пятница',
        'Суббота',
    ];
    return days[dayNumber];
};

export default RegularLessonsList;
