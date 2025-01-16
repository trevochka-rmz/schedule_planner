import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import LessonForm from '../components/LessonForm';
import './SchedulePage.css';
import axios from 'axios';
import LessonItem from '../components/LessonItem'; // Убедитесь, что импортировали

Modal.setAppElement('#root');

const SchedulePage = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formType, setFormType] = useState('');
    const [userRole, setUserRole] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [eventPosition, setEventPosition] = useState({
        top: 0,
        left: 0,
        width: 0,
    });
    const [calendarKey, setCalendarKey] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const startEditing = () => setIsEditing(true);
    const stopEditing = () => setIsEditing(false);

    const openModalForEdit = (lesson) => {
        console.log('Selected Event:', selectedEvent);
        setFormType('edit');
        setSelectedEvent(lesson);
        setIsModalOpen(true);
        startEditing();
    };
    const openModalForEditMark = (lesson) => {
        console.log('Selected Event:', selectedEvent);
        setFormType('editMark');
        setSelectedEvent(lesson);
        setIsModalOpen(true);
        startEditing();
    };
    const openModalForMark = (lesson) => {
        console.log('Mark Event:', selectedEvent);
        setFormType('mark');
        setSelectedEvent(lesson);
        setIsModalOpen(true);
        startEditing();
    };
    const openModal = (type, event = null) => {
        setFormType(type);
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
        stopEditing();
    };

    const handleAddLesson = async (lessonData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Пользователь не авторизован');

            const response = await axios.post(
                'http://localhost:5000/api/schedule/create',
                { lessonData },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const result = response.data;
            const startTime = new Date(
                `${result.lesson.date}T${result.lesson.time}`
            );
            const endTime = new Date(
                startTime.getTime() + result.lesson.duration * 60000
            );
            setEvents((prevEvents) => [
                ...prevEvents,
                {
                    id: result.lesson._id,
                    title: `${result.lesson.direction} (${result.lesson.student.fullname})`,
                    start: startTime,
                    end: endTime,
                    status: result.lesson.status,
                    extendedProps: {
                        studentId: result.lesson.student._id,
                        teacherId: result.lesson.teacher._id,
                        student: result.lesson.student.fullname,
                        teacher: result.lesson.teacher.fullname,
                        theame: result.lesson.theame,
                        direction: result.lesson.direction,
                        comment: result.lesson.student.comment,
                        commentAfter: result.lesson.student.commentAfter,
                    },
                },
            ]);

            alert('Занятие успешно добавлено!');
            closeModal();
            await fetchSchedule();
        } catch (error) {
            console.error('Ошибка добавления занятия:', error);
            alert(error.response?.data?.message || error.message);
        }
    };

    const handleEditLesson = async (updatedLessonData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Пользователь не авторизован');

            const lessonId = selectedEvent.id;
            await axios.patch(
                `http://localhost:5000/api/schedule/lessons/${lessonId}`,
                updatedLessonData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.id === lessonId
                        ? {
                              ...event,
                              title: `${updatedLessonData.direction} (${updatedLessonData.student})`,
                              start: new Date(
                                  `${updatedLessonData.date}T${updatedLessonData.time}`
                              ),
                              end: new Date(
                                  new Date(
                                      `${updatedLessonData.date}T${updatedLessonData.time}`
                                  ).getTime() +
                                      updatedLessonData.duration * 60000
                              ),
                              extendedProps: {
                                  ...event.extendedProps,
                                  ...updatedLessonData,
                              },
                          }
                        : event
                )
            );

            await fetchSchedule(); // Синхронизация данных с сервером
            closeModal();
        } catch (error) {
            console.error('Ошибка обновления занятия:', error);
            alert(error.response?.data?.message || error.message);
        }
    };

    const handleRevert = async () => {
        if (!selectedEvent || !selectedEvent.id) {
            alert('Не выбрано занятие для завершения');
            return;
        }

        const lessonId = selectedEvent.id;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:5000/api/schedule/lessons/${lessonId}/status`,
                { status: 'scheduled' },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.id === lessonId
                        ? {
                              ...event,
                              color: '#3788d8', // Вернуть синий цвет
                              status: 'scheduled',
                              extendedProps: {
                                  ...event.extendedProps,
                              },
                          }
                        : event
                )
            );

            setSelectedEvent(null);
        } catch (error) {
            console.error('Ошибка изменения статуса урока:', error);
            alert('Не удалось изменить статус урока');
        }
    };

    const handleComplete = async (updatedLessonData) => {
        if (!selectedEvent || !selectedEvent.id) {
            alert('Не выбрано занятие для завершения');
            return;
        }

        const lessonId = selectedEvent.id;

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Пользователь не авторизован');

            await axios.patch(
                `http://localhost:5000/api/schedule/lessons/${lessonId}`,
                updatedLessonData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.id === lessonId
                        ? {
                              ...event,
                              title: `${updatedLessonData.direction} (${updatedLessonData.student})`,
                              start: new Date(
                                  `${updatedLessonData.date}T${updatedLessonData.time}`
                              ),
                              end: new Date(
                                  new Date(
                                      `${updatedLessonData.date}T${updatedLessonData.time}`
                                  ).getTime() +
                                      updatedLessonData.duration * 60000
                              ),
                              extendedProps: {
                                  ...event.extendedProps,
                                  ...updatedLessonData,
                              },
                          }
                        : event
                )
            );

            await axios.patch(
                `http://localhost:5000/api/schedule/lessons/${lessonId}/status`,
                { status: 'completed' },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.id === lessonId
                        ? {
                              ...event,
                              color: 'gray',
                              status: 'completed',
                              extendedProps: {
                                  ...event.extendedProps,
                              },
                          }
                        : event
                )
            );

            await fetchSchedule(); // Синхронизация данных с сервером
            closeModal();
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            alert('Не удалось обновить статус занятия');
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent || !selectedEvent.id) {
            alert('Не выбрано занятие для удаления');
            return;
        }

        const lessonId = selectedEvent.id;
        console.log('Удаление занятия с ID:', lessonId);

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5000/api/schedule/lessons/${lessonId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setEvents((prevEvents) =>
                prevEvents.filter((event) => event.id !== lessonId)
            );

            setSelectedEvent(null); // Закрываем LessonItem
        } catch (error) {
            console.error('Ошибка удаления урока:', error);
            alert(error.response?.data?.message || error.message);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Пользователь не авторизован');

            const response = await axios.get(
                'http://localhost:5000/api/users/profile',
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const user = response.data;
            if (user.role !== 'teacher') {
                throw new Error('Доступ разрешен только преподавателям');
            }

            setUserRole(user.role);
            setTeacherId(user._id);
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
            alert(error.response?.data?.message || error.message);
        }
    };

    // const fetchSchedule = async () => {
    //     try {
    //         if (!teacherId) return;

    //         const token = localStorage.getItem('token');
    //         const response = await axios.get(
    //             `http://localhost:5000/api/schedule/teacher/${teacherId}`,
    //             {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             }
    //         );
    //         console.log(response.data.lessons);
    //         setEvents(response.data.lessons);
    //     } catch (error) {
    //         console.error('Ошибка загрузки расписания:', error);
    //         alert(error.response?.data?.message || error.message);
    //     }
    // };

    const fetchSchedule = async () => {
        try {
            if (!teacherId) return;

            const token = localStorage.getItem('token');
            console.log(teacherId);
            const response = await axios.get(
                `http://localhost:5000/api/schedule/teacher/${teacherId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log(response);
            console.log(response.data);
            const lessons = response.data.lessons.map((lesson) => ({
                id: lesson.id,
                title: `${lesson.extendedProps.direction} (${lesson.extendedProps.student})`,
                start: lesson.start,
                end: lesson.end,
                status: lesson.status,
                color: lesson.status === 'completed' ? 'gray' : '#3788d8',
                extendedProps: lesson.extendedProps,
            }));
            console.log('Обработанные занятия:', lessons);
            setEvents(lessons);
        } catch (error) {
            console.error('Ошибка загрузки расписания:', error);
            alert(error.response?.data?.message || error.message);
        }
    };

    const handleEventClick = (clickInfo) => {
        const eventId = clickInfo.event.id;
        const selectedEvent = events.find((event) => event.id === eventId);

        if (selectedEvent) {
            const eventElement = clickInfo.el;
            const rect = eventElement.getBoundingClientRect();

            const schedulePage = document.querySelector('.schedule-page');
            const scheduleRect = schedulePage.getBoundingClientRect();

            const fixedHeight = 200; // Фиксированная высота формы
            const padding = 75; // Отступ от занятия
            const offsetLeft = 90; // Смещение формы влево

            let positionTop =
                rect.top - scheduleRect.top - fixedHeight - padding;
            let positionLeft = rect.left - scheduleRect.left - offsetLeft;

            // Проверяем текущий режим календаря
            const currentView = clickInfo.view.type; // Получаем текущий тип отображения
            if (currentView === 'timeGridDay' || currentView === 'dayGridDay') {
                // Центрируем форму в режиме дня
                positionLeft = (scheduleRect.width - 300) / 2; // Центрируем форму по ширине (300 - фиксированная ширина)
            }

            // Проверяем, чтобы форма не выходила за верхнюю границу контейнера
            if (positionTop < 0) {
                positionTop =
                    rect.top - scheduleRect.top + rect.height + padding;
            }

            setEventPosition({
                top: positionTop,
                left: positionLeft,
                width: 300, // Фиксированная ширина формы
            });

            setSelectedEvent(selectedEvent);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            const lessonItemElement = document.querySelector('.lesson-item');
            const lessonFormElement = document.querySelector('.lesson-form');

            if (
                lessonItemElement &&
                !lessonItemElement.contains(event.target) &&
                !event.target.classList.contains('fc-event') &&
                (!lessonFormElement ||
                    !lessonFormElement.contains(event.target)) &&
                !isEditing // Не сбрасывать, если в режиме редактирования
            ) {
                setSelectedEvent(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing]);

    useEffect(() => {
        const handleScroll = () => {
            if (!isEditing) {
                // Не скрывать, если в режиме редактирования
                setSelectedEvent(null);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isEditing]);

    // useEffect(() => {
    //     const initializePage = async () => {
    //         await fetchUserProfile(); // Устанавливает teacherId
    //         await fetchSchedule(); // Грузит расписание
    //     };
    //     if (teacherId) {
    //         initializePage();
    //     } else {
    //         console.log('error');
    //     }
    // }, [teacherId]);
    useEffect(() => {
        const initializePage = async () => {
            try {
                await fetchUserProfile(); // Устанавливаем teacherId
                if (teacherId) {
                    await fetchSchedule(); // Грузим расписание
                }
            } catch (error) {
                console.error('Ошибка при загрузке страницы:', error);
            }
        };

        initializePage();
    }, []);

    return (
        <div className="schedule-page">
            <h2>Расписание</h2>
            {userRole === 'teacher' && (
                <button
                    className="add-lesson-button"
                    onClick={() => openModal('add')}
                >
                    Добавить занятие
                </button>
            )}

            <FullCalendar
                key={calendarKey} // Добавьте здесь ключ
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                events={events}
                eventClick={handleEventClick} // Плавно обновляем выбранное событие
                locale="ru"
                height="500px"
                minTime="08:00:00"
                maxTime="24:00:00"
                slotDuration="00:30:00"
                snapDuration="00:30:00"
                scrollTime="08:00:00"
                allDaySlot={false}
                buttonText={{
                    today: 'Сегодня',
                    month: 'Месяц',
                    week: 'Неделя',
                    day: 'День',
                }}
            />

            {/* Рендерим LessonItem, если selectedEvent выбран */}
            {selectedEvent && (
                <LessonItem
                    event={selectedEvent}
                    position={eventPosition}
                    onEdit={(lesson) => openModalForEdit(lesson)} // Используем функцию для редактирования
                    onRevert={handleRevert}
                    onDelete={handleDelete}
                    onMark={(lesson) => openModalForMark(lesson)}
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Занятие"
                className="react-modal-content"
                overlayClassName="react-modal-overlay"
            >
                {formType === 'edit' && selectedEvent ? (
                    <LessonForm
                        formType="edit"
                        selectedEvent={selectedEvent}
                        onSubmit={
                            formType === 'edit' || formType === 'editMark'
                                ? handleEditLesson
                                : formType === 'mark'
                                ? handleComplete
                                : handleAddLesson
                        }
                        onCancel={closeModal}
                    />
                ) : formType === 'edit' && selectedEvent ? (
                    <LessonForm
                        formType="editMark"
                        selectedEvent={selectedEvent}
                        onSubmit={
                            formType === 'edit' || formType === 'editMark'
                                ? handleEditLesson
                                : formType === 'mark'
                                ? handleComplete
                                : handleAddLesson
                        }
                        onCancel={closeModal}
                    />
                ) : formType === 'mark' && selectedEvent ? (
                    <LessonForm
                        formType="mark"
                        selectedEvent={selectedEvent}
                        onSubmit={
                            formType === 'edit' || formType === 'editMark'
                                ? handleEditLesson
                                : formType === 'mark'
                                ? handleComplete
                                : handleAddLesson
                        }
                        onCancel={closeModal}
                    />
                ) : (
                    <LessonForm
                        formType="add"
                        onSubmit={
                            formType === 'edit' || formType === 'editMark'
                                ? handleEditLesson
                                : formType === 'mark'
                                ? handleComplete
                                : handleAddLesson
                        }
                        teacher={teacherId}
                        onCancel={closeModal}
                    />
                )}
            </Modal>
        </div>
    );
};

export default SchedulePage;
