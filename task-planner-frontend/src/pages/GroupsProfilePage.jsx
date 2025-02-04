import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './GroupsProfilePage.css';
import AddStudentsModal from '../components/AddStudentsModal.jsx';
import AttendanceWidgetGroup from '../components/AttendanceWidgetGroup';
import AddRegularGroupLessonModal from '../components/AddRegularGroupLessonModal';
import { Link } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa';

import RegularGroupLessonsList from '../components/RegularGroupLessonsList';

import { notifySuccess, notifyError } from '../../utils/notification.js';

export default function GroupsProfilePage({ role }) {
    const { id } = useParams(); // Получаем id студента из маршрута
    const [group, setGroup] = useState(null);
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lessons, setLessons] = useState([]);
    const [regularLessons, setRegularLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const handleAddStudent = () => {
        setIsAddStudentModalOpen(true);
    };

    const handleCloseAddStudentModal = () => {
        setIsAddStudentModalOpen(false);
    };
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
            const { data } = await axios.get(
                `http://localhost:5000/api/group/get-info/${id}`,
                config
            );
            setGroup(data.group);

            const lessonsResponse = await axios.get(
                `http://localhost:5000/api/group-lesson/lesson/${id}`,
                config
            );
            setLessons(lessonsResponse.data.lessons);

            // Заново загружаем данные о регулярных уроках
            const regularLessonsResponse = await axios.get(
                `http://localhost:5000/api/regular/regular-group/${id}`,
                config
            );
            setRegularLessons(regularLessonsResponse.data);
            notifySuccess('Занятие успешно добавлено!');
        } catch (error) {
            console.error('Ошибка загрузки профиля группы:', error);
        }

        fetchGroup();
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const fetchGroup = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.get(
                `http://localhost:5000/api/group/get-info/${id}`,
                config
            );
            setGroup(data.group);
        } catch (error) {
            console.error('Ошибка загрузки профиля группы:', error);
        }
    };
    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const { data } = await axios.get(
                    `http://localhost:5000/api/group-lesson/lesson/${id}`,
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
                    `http://localhost:5000/api/regular/regular-group/${id}`,
                    config
                );
                setRegularLessons(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGroup();
        fetchLessons();
        fetchRegularLessons();
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
                    `http://localhost:5000/api/regular/regular-group/${id}`,
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
    const handleDeleteStudent = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.delete(
                `http://localhost:5000/api/group/delete/${id}/students/${studentId}`,
                config
            );

            notifySuccess('Студент успешно удалён из группы');
            handleSuccess();
        } catch (error) {
            console.error('Ошибка при удалении студента:', error);
            notifyError('Ошибка при удалении студента');
        }
    };
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
                `http://localhost:5000/api/regular/delete-group/${lessonId}`,
                config
            );

            // Обновляем состояние регулярных уроков
            setRegularLessons((prev) =>
                prev.filter((lesson) => lesson._id !== lessonId)
            );

            // Заново загружаем список занятий
            const { data } = await axios.get(
                `http://localhost:5000/api/group-lesson/lesson/${id}`,
                config
            );
            setLessons(data.lessons);

            notifySuccess('Урок успешно удалён и данные обновлены!');
        } catch (error) {
            console.error('Ошибка удаления:', error);
            notifyError('Ошибка, попробуйте снова');
        }
    };
    if (!group) {
        return <p>Загрузка данных...</p>;
    }
    return (
        <div className="student-profile-page">
            {console.log(lessons)}
            <div className="left-block-page">
                <div className="left-block-group">
                    <div className="main-block-info-group">
                        <h2>{group.name || '—'}</h2>
                        <p>Направление: {group.direction || '—'}</p>
                        <p>{group.description || ''}</p>
                    </div>
                    <div className="additional-block-info-group">
                        <p>
                            Статус: {group.isActive ? 'Активен' : 'Неактивен'}
                        </p>
                        <p>Локация: {group.location || '—'}</p>
                    </div>
                </div>
                <div className="block-attendance">
                    <AttendanceWidgetGroup
                        groupId={id}
                        lessons={lessons}
                        setLessons={setLessons}
                    />
                </div>
            </div>

            <div className="right-block-group-profile">
                <h3>Дополнительная информация:</h3>
                <table className="profile-table">
                    <tbody>
                        <tr>
                            <th>Лимит:</th>
                            <td>{group.limit || '—'}</td>
                        </tr>
                        <tr>
                            <th>Ссылка на чат:</th>
                            <td>
                                <a target="_blank" href={group.linkToChat}>
                                    {group.linkToChat || '—'}
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="list-student-group">
                    <div className="header-list-group">
                        <h3>Список участников группы:</h3>
                        {role === 'admin' || role !== 'admin' ? (
                            <button type="button" onClick={handleAddStudent}>
                                Добавить
                            </button>
                        ) : null}
                    </div>
                    <AddStudentsModal
                        isOpen={isAddStudentModalOpen}
                        onClose={handleCloseAddStudentModal}
                        groupId={id}
                        onSuccess={handleSuccess}
                        groupLimit={group.limit}
                    ></AddStudentsModal>
                    <ul>
                        {group.students.map((student, index) => (
                            <div className="item-list-group" key={student._id}>
                                <Link
                                    to={`/students/${student._id}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <li className="student-item">
                                        {index + 1}. {student.fullname}
                                    </li>
                                </Link>
                                <button
                                    onClick={() =>
                                        handleDeleteStudent(student._id)
                                    }
                                    className="delete-button-profile"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </ul>
                    <div className="regular-lesson-block-header margin-top-small">
                        <h3>Регулярные групповые уроки</h3>
                        <button onClick={handleOpenModal}>Добавить</button>
                    </div>
                    <AddRegularGroupLessonModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSuccess={handleSuccess}
                    />
                    <div className="regular-lesson-list">
                        <RegularGroupLessonsList
                            groupId={id}
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
