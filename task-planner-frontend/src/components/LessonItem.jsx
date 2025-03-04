import React from 'react';
import './LessonItem.css';

const LessonItem = ({
    event,
    position,
    onEdit,
    onEditCompleted,
    onRevert,
    onDelete,
    onCancel,
    onMark,
}) => {
    if (!event) return null;
    const isCompleted = event.status == 'completed';
    const isCanceled = event.status === 'canceled';
    const formatTime = (dateString) => {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleTimeString('ru-RU', options);
    };

    const startTime = formatTime(event.start);
    const endTime = formatTime(event.end);
    const eventDate = new Date(event.start).toLocaleDateString('ru-RU');

    return (
        <div
            className="lesson-item"
            style={{
                position: 'absolute',
                top: position.top + 'px', // Позиция сверху
                left: position.left + 'px', // Позиция слева
                width: position.width + 'px', // Ширина элемента
                zIndex: 1000, // Убедитесь, что компонент выше других
                backgroundColor: '#fff',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                // textDecoration: isCanceled ? 'line-through' : 'none',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
        >
            <h3>{event.title}</h3>
            {isCompleted ? (
                <p>
                    <strong>Тема:</strong> {event.extendedProps.theme}
                </p>
            ) : (
                false
            )}
            <p>
                <strong>Дата:</strong> {eventDate}
            </p>
            <p>
                <strong>Время:</strong> {startTime} - {endTime}
            </p>
            <p>
                <strong>Студент:</strong> {event.extendedProps.student}
            </p>
            <p>
                <strong>Преподаватель:</strong> {event.extendedProps.teacher}
            </p>
            <p>
                <strong>Направление:</strong> {event.extendedProps.direction}
            </p>
            {!isCompleted ? (
                <p>
                    <strong>Комментарий:</strong> {event.extendedProps.comment}
                </p>
            ) : (
                <p>
                    <strong>Комментарий:</strong>{' '}
                    {event.extendedProps.commentAfter}
                </p>
            )}

            {isCanceled ? (
                <div className="lesson-item-buttons">
                    <div className="button-main-canceled">
                        <button onClick={() => onRevert(event)}>Вернуть</button>
                    </div>
                    <div className="button-second">
                        <button onClick={() => onDelete(event)}>Удалить</button>
                    </div>
                </div>
            ) : (
                <div className="lesson-item-buttons">
                    <div className="button-main">
                        {!isCompleted ? (
                            <button onClick={() => onEdit(event)}>
                                Изменить
                            </button>
                        ) : (
                            <button onClick={() => onEditCompleted(event)}>
                                Открыть
                            </button>
                        )}

                        <button onClick={() => onDelete(event)}>Удалить</button>

                        <button
                            onClick={() => onCancel(event)}
                            disabled={isCompleted}
                        >
                            Отменить
                        </button>
                    </div>
                    <div className="button-second">
                        {!isCompleted ? (
                            <button onClick={() => onMark(event)}>
                                Провести
                            </button>
                        ) : (
                            <button onClick={() => onRevert(event)}>
                                Вернуть
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonItem;
