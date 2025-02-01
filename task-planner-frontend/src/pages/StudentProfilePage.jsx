import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './StudentProfilePage.css';
import AttendanceWidget from '../components/AttendanceWidget';
import AddRegularLessonModal from '../components/AddRegularLessonModal';
import RegularLessonsList from '../components/RegularLessonsList';

import { notifySuccess, notifyError } from '../../utils/notification.js';

function StudentProfilePage() {
    const { id } = useParams(); // Получаем id студента из маршрута
    const [student, setStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [regularLessons, setRegularLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };
    const handleSuccess = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            // Заново загружаем данные о занятиях
            const lessonsResponse = await axios.get(
                `http://localhost:5000/api/schedule/student/${id}`,
                config
            );
            setLessons(lessonsResponse.data.lessons);

            // Заново загружаем данные о регулярных уроках
            const regularLessonsResponse = await axios.get(
                `http://localhost:5000/api/regular/regular-lessons/${id}`,
                config
            );
            setRegularLessons(regularLessonsResponse.data);
            notifySuccess('Занятие успешно добавлено!');
        } catch (error) {
            console.error(
                'Ошибка обновления данных после добавления урока:',
                error
            );
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const { data } = await axios.get(
                    `http://localhost:5000/api/users/student/${id}`,
                    config
                );
                setStudent(data);
            } catch (error) {
                console.error('Ошибка загрузки профиля студента:', error);
            }
        };

        const fetchLessons = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const { data } = await axios.get(
                    `http://localhost:5000/api/schedule/student/${id}`,
                    config
                );
                setLessons(data.lessons);
            } catch (error) {
                console.error('Ошибка загрузки занятий:', error);
            }
        };
        const fetchRegularLessons = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const { data } = await axios.get(
                    `http://localhost:5000/api/regular/regular-lessons/${id}`,
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

        fetchStudent();
        fetchLessons();
    }, [id]);
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
                    `http://localhost:5000/api/regular/regular-lessons/${id}`,
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
    }, [id]);

    const handleDelete = async (lessonId) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            // Удаляем регулярное занятие
            await axios.delete(
                `http://localhost:5000/api/regular/delete/${lessonId}`,
                config
            );

            // Обновляем состояние регулярных уроков
            setRegularLessons((prev) =>
                prev.filter((lesson) => lesson._id !== lessonId)
            );

            // Заново загружаем список занятий
            const { data } = await axios.get(
                `http://localhost:5000/api/schedule/student/${id}`,
                config
            );
            setLessons(data.lessons);

            notifySuccess('Урок успешно удалён и данные обновлены!');
        } catch (error) {
            console.error('Ошибка удаления:', error);
            notifyError('Ошибка, попробуйте снова');
        }
    };

    if (!student) {
        return <p>Загрузка данных...</p>;
    }
    return (
        <div className="student-profile-page">
            <div className="left-block-page">
                <div className="left-block-student">
                    <img
                        src={
                            student.urlPhoto ||
                            'https://via.placeholder.com/150'
                        }
                        alt="Фото студента"
                        className="profile-pic"
                    />
                    <div className="profile-info">
                        <h2>{student.fullname}</h2>
                        <p>
                            Направление: {student.studentInfo?.direction || '—'}
                        </p>
                        <p>
                            Статус:{' '}
                            {student.studentInfo?.isActive
                                ? 'Активен'
                                : 'Неактивен'}
                        </p>
                    </div>
                </div>
                <div className="block-attendance">
                    <AttendanceWidget
                        studentId={id}
                        lessons={lessons}
                        setLessons={setLessons}
                    />
                </div>
            </div>

            <div className="right-block-student-profile">
                <h3>Контакты</h3>
                <table className="profile-table">
                    <tbody>
                        <tr>
                            <th>Телефон:</th>
                            <td>{student.phone || '—'}</td>
                        </tr>
                        <tr>
                            <th>Email:</th>
                            <td>{student.email || '—'}</td>
                        </tr>
                    </tbody>
                </table>
                <h3>Уроки</h3>
                <table className="profile-table">
                    <tbody>
                        <tr>
                            <th>Остаток:</th>
                            <td>
                                {student.studentInfo?.lessonsRemaining || '—'}
                            </td>
                        </tr>
                        <tr>
                            <th>Проведено:</th>
                            <td>
                                {student.studentInfo?.lessonsCompleted || '—'}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="regular-lesson-block">
                    <div className="regular-lesson-block-header">
                        <h3>Регулярные уроки</h3>
                        <button onClick={handleOpenModal}>Добавить</button>
                    </div>
                    <AddRegularLessonModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSuccess={handleSuccess}
                    />
                    <div className="regular-lesson-list">
                        <RegularLessonsList
                            studentId={id}
                            regularLessons={regularLessons}
                            setRegularLessons={setRegularLessons}
                            handleDelete={handleDelete}
                            loading={loading}
                            setLoading={setLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentProfilePage;
