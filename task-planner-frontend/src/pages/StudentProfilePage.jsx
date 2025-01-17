import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './StudentProfilePage.css';
import AttendanceWidget from '../components/AttendanceWidget';

function StudentProfilePage() {
    const { id } = useParams(); // Получаем id студента из маршрута
    const [student, setStudent] = useState(null);

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
                console.log(data);
                setStudent(data);
            } catch (error) {
                console.error('Ошибка загрузки профиля студента:', error);
            }
        };

        fetchStudent();
    }, [id]);

    if (!student) {
        return <p>Загрузка данных...</p>;
    }
    return (
        <div className="student-profile-page">
            <div className="left-block">
                <img
                    src={student.urlPhoto || 'https://via.placeholder.com/150'}
                    alt="Фото студента"
                    className="profile-pic"
                />
                <div className="profile-info">
                    <h2>{student.fullname}</h2>
                    <p>Направление: {student.studentInfo?.direction || '—'}</p>
                    <p>
                        Статус:{' '}
                        {student.studentInfo?.isActive
                            ? 'Активен'
                            : 'Неактивен'}
                    </p>
                </div>
            </div>
            <div className="right-block">
                <h3>Контакты</h3>
                <table className="profile-table">
                    <tbody>
                        <tr>
                            <th>Телефон:</th>
                            <td>
                                {student.studentInfo?.contacts?.find(
                                    (c) => c.type === 'phone'
                                )?.value || '—'}
                            </td>
                        </tr>
                        <tr>
                            <th>Email:</th>
                            <td>{student.email || '—'}</td>
                        </tr>
                    </tbody>
                </table>
                <h3>Количество проведенных уроков</h3>
                <p>{student.studentInfo?.lessonsCompleted || 0}</p>
            </div>

            <AttendanceWidget studentId={id} />
        </div>
    );
}

export default StudentProfilePage;
