import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RegularLessonsList.css';
import { FaTrash, FaEdit } from 'react-icons/fa';

const RegularGroupLessonsList = ({
    studentId,
    regularLessons,
    setRegularLessons,
    handleDelete,
    loading,
    setLoading,
}) => {
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false); // Флаг для отображения всех записей

    if (loading) {
        return <p>Загрузка регулярных занятий...</p>;
    }

    if (error) {
        return <p className="error-message">Ошибка: {error}</p>;
    }

    if (regularLessons.length === 0) {
        return <p>Регулярное занятие не создано</p>;
    }

    const visibleLessons = showAll
        ? regularLessons
        : regularLessons.slice(0, 2); // Показываем первые две записи, если showAll = false

    const calculateEndTime = (startTime, duration) => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const endTimeDate = new Date();
        endTimeDate.setHours(hours);
        endTimeDate.setMinutes(minutes + duration);
        return `${endTimeDate
            .getHours()
            .toString()
            .padStart(2, '0')}:${endTimeDate
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;
    };

    return (
        <div className="regular-info">
            {visibleLessons.map((lesson) => {
                const endTime = calculateEndTime(
                    lesson.startTime,
                    lesson.duration
                );

                return (
                    <div className="regular-lesson" key={lesson._id}>
                        <div className="lesson-body">
                            <p className="regular-lesson-day">
                                {getDayOfWeek(lesson.dayOfWeek)}
                            </p>
                            <p className="regular-lesson-time">
                                {lesson.startTime}–{endTime} ({lesson.duration}{' '}
                                мин)
                            </p>
                            <p className="regular-lesson-details">
                                {lesson.direction}, {lesson.location}
                            </p>
                            <p className="regular-lesson-period">
                                {new Date(
                                    lesson.periodStart
                                ).toLocaleDateString()}
                                –
                                {new Date(
                                    lesson.periodEnd
                                ).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="lesson-header">
                            <div className="lesson-actions">
                                {/* <button
                                    className="edit-button-profile"
                                    onClick={() => handleEdit(lesson._id)}
                                >
                                    <FaEdit />
                                </button> */}
                                <button
                                    className="delete-button-profile"
                                    onClick={() => handleDelete(lesson._id)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
            {regularLessons.length > 2 && (
                <button
                    className="show-more-button"
                    onClick={() => setShowAll((prev) => !prev)}
                >
                    {showAll ? 'Скрыть' : 'Показать еще'}
                </button>
            )}
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

export default RegularGroupLessonsList;
