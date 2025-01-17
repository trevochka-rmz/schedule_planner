import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentsPage.css';
import { Link } from 'react-router-dom';

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [visibleFields, setVisibleFields] = useState({
        fullname: true,
        direction: true,
        isActive: true,
        contacts: true,
        schedule: true, // Пока это поле пустое
    });
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const { data } = await axios.get(
                    'http://localhost:5000/api/users/students',
                    config
                );
                setStudents(data);
            } catch (error) {
                console.error('Ошибка загрузки данных студентов:', error);
            }
        };

        fetchStudents();
    }, []);

    const handleSearch = (event) => {
        setSearch(event.target.value.toLowerCase());
    };

    const toggleField = (field) => {
        setVisibleFields((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const filteredStudents = students.filter(
        (student) =>
            student.fullname.toLowerCase().includes(search) ||
            (student.studentInfo.direction &&
                student.studentInfo.direction.toLowerCase().includes(search))
    );

    return (
        <div className="students-page">
            <h1>Список студентов</h1>

            <div className="toolbar">
                <input
                    type="text"
                    placeholder="Поиск по имени или направлению..."
                    value={search}
                    onChange={handleSearch}
                    className="search-input"
                />
                <button
                    className="settings-button"
                    onClick={() => setShowSettings(true)}
                >
                    Настройка полей
                </button>
            </div>

            {showSettings && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Настройка полей</h3>
                        {Object.keys(visibleFields).map((field) => (
                            <label key={field}>
                                <input
                                    type="checkbox"
                                    checked={visibleFields[field]}
                                    onChange={() => toggleField(field)}
                                />
                                {field === 'fullname'
                                    ? 'Полное имя'
                                    : field === 'direction'
                                    ? 'Направление'
                                    : field === 'isActive'
                                    ? 'Статус'
                                    : field === 'contacts'
                                    ? 'Контакты'
                                    : 'Расписание'}
                            </label>
                        ))}
                        <button
                            className="close-button"
                            onClick={() => setShowSettings(false)}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}

            <table className="students-table">
                <thead>
                    <tr>
                        {visibleFields.fullname && <th>Полное имя</th>}
                        {visibleFields.direction && <th>Направление</th>}
                        {visibleFields.isActive && <th>Статус</th>}
                        {visibleFields.contacts && <th>Контакты</th>}
                        {visibleFields.schedule && <th>Расписание</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.map((student) => (
                        <tr key={student._id}>
                            {visibleFields.fullname && (
                                <td>
                                    <Link
                                        to={`/students/${student._id}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        {student.fullname}
                                    </Link>
                                </td>
                            )}
                            {visibleFields.direction && (
                                <td>{student.studentInfo.direction || '—'}</td>
                            )}
                            {visibleFields.isActive && (
                                <td>
                                    {student.studentInfo.isActive
                                        ? 'Активен'
                                        : 'Неактивен'}
                                </td>
                            )}
                            {visibleFields.contacts && (
                                <td>
                                    {student.studentInfo.contacts
                                        .map(
                                            (contact) =>
                                                `${contact.type}: ${contact.value}`
                                        )
                                        .join(', ') || '—'}
                                </td>
                            )}
                            {visibleFields.schedule && <td>—</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentsPage;
