import React, { useEffect, useState } from 'react';
import '@fullcalendar/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { notifySuccess, notifyError } from '../../utils/notification.js';

import '@fullcalendar/common/main.css';

import Modal from 'react-modal';
import LessonForm from '../components/LessonForm';
import LessonItem from '../components/LessonItem';
import './SchedulePage.css';

import axios from 'axios';

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
            closeModal();
            await fetchSchedule();
            notifySuccess('Занятие успешно добавлено');
        } catch (error) {
            console.error('Ошибка добавления занятия:', error);
            notifyError('Ошибка, попробуйте снова');
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
            notifySuccess('Занятие успешно обновлено');
        } catch (error) {
            console.error('Ошибка обновления занятия:', error);
            notifyError('Ошибка, попробуйте снова');
        }
    };

    const handleRevert = async () => {
        if (!selectedEvent || !selectedEvent.id) {
            notifyError('Не выбрано занятие для завершения');
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
                              color: '#3788d8',
                              status: 'scheduled',
                              extendedProps: {
                                  ...event.extendedProps,
                              },
                          }
                        : event
                )
            );

            setSelectedEvent(null);
            notifySuccess('Занятие успешно возвращено');
        } catch (error) {
            console.error('Ошибка изменения статуса урока:', error);
            notifyError('Не удалось изменить статус урока');
        }
    };

    const handleComplete = async (updatedLessonData) => {
        if (!selectedEvent || !selectedEvent.id) {
            notifyError('Не выбрано занятие для завершения');
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
            notifySuccess('Занятие успешно проведено');
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            notifyError('Не удалось обновить статус занятия');
        }
    };
    const handleCancelLesson = async () => {
        if (!selectedEvent || !selectedEvent.id) {
            notifyError('Не выбрано занятие для отмены');
            return;
        }

        const lessonId = selectedEvent.id;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:5000/api/schedule/lessons/${lessonId}/status`,
                { status: 'canceled' },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.id === lessonId
                        ? {
                              ...event,
                              status: 'canceled',
                              color: 'gray',
                              extendedProps: {
                                  ...event.extendedProps,
                              },
                          }
                        : event
                )
            );

            notifySuccess('Занятие успешно отменено');
        } catch (error) {
            console.error('Ошибка отмены занятия:', error);
            notifyError('Не удалось отменить занятие');
        }
    };
    const handleDelete = async () => {
        if (!selectedEvent || !selectedEvent.id) {
            notifyError('Не выбрано занятие для удаления');
            return;
        }

        const lessonId = selectedEvent.id;

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

            setSelectedEvent(null);
            notifySuccess('Занятие успешно удалено');
        } catch (error) {
            console.error('Ошибка удаления урока:', error);
            notifyError('Ошибка, попробуйте снова');
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

            setUserRole(user.role);
            setTeacherId(user._id);
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
            notifyError('Ошибка, попробуйте снова');
        }
    };

    const fetchSchedule = async () => {
        try {
            if (!teacherId) return;

            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/schedule/teacher/${teacherId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log('Данные занятий:', response.data); // Логируем ответ
            const lessons = response.data.lessons.map((lesson) => ({
                id: lesson.id,
                title: `${lesson.extendedProps.direction} (${lesson.extendedProps.student})`,
                start: lesson.start,
                end: lesson.end,
                status: lesson.status,
                color:
                    lesson.status === 'completed' ||
                    lesson.status === 'canceled'
                        ? 'gray'
                        : '#3788d8',
                extendedProps: lesson.extendedProps,
            }));
            setEvents(lessons);
        } catch (error) {
            console.error('Ошибка загрузки расписания:', error);
            notifyError('Расписание не найдено');
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

            const fixedHeight = 200;
            const padding = 75;
            const offsetLeft = 90;

            let positionTop =
                rect.top - scheduleRect.top - fixedHeight - padding;
            let positionLeft = rect.left - scheduleRect.left - offsetLeft;

            const currentView = clickInfo.view.type;
            if (currentView === 'timeGridDay' || currentView === 'dayGridDay') {
                positionLeft = (scheduleRect.width - 300) / 2;
            }

            if (positionTop < 0) {
                positionTop =
                    rect.top - scheduleRect.top + rect.height + padding;
            }

            setEventPosition({
                top: positionTop,
                left: positionLeft,
                width: 300,
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
                !isEditing
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
                setSelectedEvent(null);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isEditing]);

    useEffect(() => {
        const initializePage = async () => {
            try {
                await fetchUserProfile();
            } catch (error) {
                console.error('Ошибка при загрузке страницы:', error);
            }
        };

        initializePage();
    }, []);

    useEffect(() => {
        if (teacherId) {
            fetchSchedule();
        }
    }, [teacherId]);

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
                key={calendarKey}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                events={events}
                eventClick={handleEventClick}
                eventClassNames={(arg) => {
                    return arg.event.extendedProps.status === 'canceled'
                        ? ['canceled-event']
                        : [];
                }}
                locale="ru"
                height="700px"
                slotMinTime="09:00"
                slotMaxTime="24:00"
                slotDuration="00:15"
                snapDuration="00:30"
                scrollTime="08:00"
                allDaySlot={false}
                slotLabelInterval="00:30"
                slotLabelFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    omitZeroMinute: false,
                    meridiem: false,
                }}
                buttonText={{
                    today: 'Сегодня',
                    month: 'Месяц',
                    week: 'Неделя',
                    day: 'День',
                }}
            />

            {selectedEvent && (
                <LessonItem
                    event={selectedEvent}
                    position={eventPosition}
                    onEdit={(lesson) => openModalForEdit(lesson)}
                    onRevert={handleRevert}
                    onDelete={handleDelete}
                    onEditCompleted={(lesson) => openModalForEditMark(lesson)}
                    onMark={(lesson) => openModalForMark(lesson)}
                    onCancel={handleCancelLesson}
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Занятие"
                className="react-modal-content"
                overlayClassName="react-modal-overlay"
            >
                <LessonForm
                    formType={formType}
                    selectedEvent={selectedEvent}
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
            </Modal>
        </div>
    );
};

export default SchedulePage;
