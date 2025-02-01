import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GroupsPage.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function GroupsPage() {
    const [groups, setGroups] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const dayOfWeek = {
        Monday: 'Понедельник',
        Tuesday: 'Вторник',
        Wednesday: 'Среда',
        Thursday: 'Четверг',
        Friday: 'Пятница',
        Saturday: 'Суббота',
        Sunday: 'Воскресенье',
    };

    const fetchAllGroups = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5000/api/group/groups'
            );
            setAllGroups(response.data.groups);
        } catch (error) {
            console.error('Ошибка загрузки всех групп:', error);
        }
    };

    const fetchGroups = async (page = 1) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/group/groups-pagination?page=${page}&limit=8`
            );
            setGroups(response.data.groups);
            setTotalPages(Math.ceil(response.data.total / 8));
        } catch (error) {
            console.error('Ошибка загрузки данных групп:', error);
        }
    };

    useEffect(() => {
        fetchGroups(currentPage);
        fetchAllGroups();
    }, [currentPage, navigate]);

    const handleSearch = (event) => {
        setSearch(event.target.value.toLowerCase());
    };

    const filteredGroups = search
        ? allGroups.filter(
              (group) =>
                  group.name.toLowerCase().includes(search) ||
                  group.direction.toLowerCase().includes(search)
          )
        : groups;

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="groups-page">
            <h1 className="title-student-page">Список групп</h1>

            <div className="toolbar">
                <input
                    type="text"
                    placeholder="Поиск по локации или направлению"
                    value={search}
                    onChange={handleSearch}
                    className="search-input-group"
                />
            </div>

            <table className="groups-table">
                <thead>
                    <tr>
                        <th>Название группы</th>
                        <th>Направление</th>
                        <th>Локация</th>
                        <th>Статус</th>
                        <th>Расписание</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredGroups.map((group) => (
                        <tr key={group._id}>
                            <td>
                                <Link
                                    to={`/groups/${group._id}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    {group.name}
                                </Link>
                            </td>
                            <td>{group.direction || '—'}</td>
                            <td>{group.location || '—'}</td>
                            <td>{group.isActive ? 'Активен' : 'Неактивен'}</td>
                            <td>
                                {dayOfWeek[group.day] || '—'}{' '}
                                {group.time || '—'}
                            </td>
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
}
