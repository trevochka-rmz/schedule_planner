import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentsPage.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]); // Для всех студентов
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const [visibleFields, setVisibleFields] = useState({
        fullname: true,
        direction: true,
        isActive: true,
        phone: true,
        email: true,
    });
    const [showSettings, setShowSettings] = useState(false);

    // Загружаем всех студентов
    const fetchAllStudents = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5000/api/users/students-all'
            );
            setAllStudents(response.data.students);
        } catch (error) {
            console.error('Ошибка загрузки всех студентов:', error);
        }
    };

    // Загружаем студентов для текущей страницы
    const fetchStudents = async (page = 1) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/users/students?page=${page}&limit=8`
            );
            setStudents(response.data.students);
            setTotalPages(Math.ceil(response.data.total / 8));
        } catch (error) {
            console.error('Ошибка загрузки данных студентов:', error);
        }
    };

    useEffect(() => {
        fetchStudents(currentPage); // Загружаем студентов для текущей страницы
        fetchAllStudents(); // Загружаем всех студентов
    }, [currentPage, navigate]);

    const handleSearch = (event) => {
        setSearch(event.target.value.toLowerCase());
    };

    // Фильтруем всех студентов, если введен поисковый запрос
    const filteredStudents = search
        ? allStudents.filter(
              (student) =>
                  student.fullname.toLowerCase().includes(search) ||
                  (student.studentInfo.direction &&
                      student.studentInfo.direction
                          .toLowerCase()
                          .includes(search))
          )
        : students; // Если поиск пустой, показываем текущую страницу

    const toggleField = (field) => {
        setVisibleFields((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="students-page">
            <h1 className="title-student-page">Список студентов</h1>

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
                        {visibleFields.phone && <th>Номер</th>}
                        {visibleFields.email && <th>Почта</th>}
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
                            {visibleFields.phone && (
                                <td>{student.phone || '—'}</td>
                            )}
                            {visibleFields.email && (
                                <td>{student.email || '—'}</td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Назад
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                        <button
                            key={page}
                            className={`pagination-button ${
                                page === currentPage ? 'active' : ''
                            }`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    )
                )}
                <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Вперед
                </button>
            </div>
        </div>
    );
};

export default StudentsPage;
