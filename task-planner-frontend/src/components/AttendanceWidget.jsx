import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AttendanceWidget.css';

const AttendanceWidget = ({ studentId, lessons, setLessons }) => {
    // const [lessons, setLessons] = useState([]);
    const [showLegend, setShowLegend] = useState(false);

    // useEffect(() => {
    //     const fetchLessons = async () => {
    //         try {
    //             const token = localStorage.getItem('token');
    //             const config = {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             };

    //             const { data } = await axios.get(
    //                 `http://localhost:5000/api/schedule/student/${studentId}`,
    //                 config
    //             );
    //             console.log(data);
    //             setLessons(data.lessons);
    //         } catch (error) {
    //             console.error('Ошибка при загрузке расписания:', error);
    //         }
    //     };

    //     fetchLessons();
    // }, [studentId]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'completed':
                return 'lesson-done';
            case 'canceled':
                return 'lesson-cancelled';
            case 'scheduled':
                return 'lesson-planned';
            default:
                return '';
        }
    };

    return (
        <div className="attendance-widget">
            <h3>Посещения студента</h3>
            <div className="lessons-grid">
                {lessons.map((lesson) => (
                    <div
                        key={lesson.id}
                        className={`lesson-card ${getStatusClass(
                            lesson.status
                        )}`}
                    >
                        <div className="status-icon">
                            {lesson.status === 'completed' && '✔'}
                            {lesson.status === 'canceled' && '−'}
                        </div>
                        <div className="lesson-info">
                            <p>
                                <strong>
                                    {lesson.dayOfWeek}{' '}
                                    {lesson.extendedProps.direction}
                                </strong>
                            </p>
                            <p>{new Date(lesson.start).toLocaleDateString()}</p>
                            <p>{new Date(lesson.start).toLocaleTimeString()}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button
                className="legend-button"
                onClick={() => setShowLegend(!showLegend)}
            >
                Показать легенду
            </button>
            {showLegend && (
                <div className="legend">
                    <h4>Легенда</h4>
                    <p>
                        <span className="legend-icon lesson-done">✔</span>{' '}
                        Проведено
                    </p>
                    <p>
                        <span className="legend-icon lesson-cancelled">−</span>{' '}
                        Отменено
                    </p>
                    <p>
                        <span className="legend-icon lesson-planned"></span>{' '}
                        Планируется
                    </p>
                </div>
            )}
        </div>
    );
};

export default AttendanceWidget;
