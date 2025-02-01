import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddUserForm from '../components/AddUserForm';
import './UserManagementPage.css';
import { format } from 'date-fns';
import { notifySuccess, notifyError } from '../../utils/notification.js';

const roleMapping = {
    student: 'Клиент',
    teacher: 'Преподаватель',
    manager: 'Менеджер',
    admin: 'Админ',
};

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Текущая страница
    const [totalPages, setTotalPages] = useState(1); // Общее количество страниц
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async (page = 1) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/users/all?page=${page}&limit=8`
            );
            setUsers(response.data.users);
            setTotalPages(Math.ceil(response.data.total / 8)); // Рассчитать общее количество страниц
        } catch (error) {
            console.error('Ошибка при загрузке пользователей:', error);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage, navigate]);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleEditUser = (user) => {
        const formattedUser = {
            ...user,
            studentInfo: {
                ...user.studentInfo,
                birthDate: user.studentInfo.birthDate
                    ? format(new Date(user.studentInfo.birthDate), 'yyyy-MM-dd')
                    : '',
            },
            teacherInfo: {
                ...user.teacherInfo,
                birthDate: user.teacherInfo.birthDate
                    ? format(new Date(user.teacherInfo.birthDate), 'yyyy-MM-dd')
                    : '',
            },
            managerInfo: {
                ...user.managerInfo,
                birthDate: user.managerInfo.birthDate
                    ? format(new Date(user.managerInfo.birthDate), 'yyyy-MM-dd')
                    : '',
            },
        };
        setEditingUser(formattedUser); // Устанавливаем редактируемого пользователя
        setShowModal(true);
    };

    const handleDeleteUser = async (id) => {
        const confirmed = window.confirm(
            'Вы уверены, что хотите удалить пользователя?'
        );
        if (confirmed) {
            try {
                await axios.delete(
                    `http://localhost:5000/api/users/profile/${id}`
                );
                notifySuccess('Пользователь успешно удален!');
                fetchUsers(currentPage); // Обновить список пользователей
            } catch (error) {
                console.error('Ошибка при удалении пользователя:', error);
                notifyError('Ошибка сервера');
            }
        }
    };

    return (
        <div className="user-management-page">
            <h1 className="user-management-title">Управление пользователями</h1>
            <button
                className="add-user-button"
                onClick={() => {
                    setEditingUser(null);
                    setShowModal(true);
                }}
            >
                Добавить пользователя
            </button>
            {showModal && (
                <div className="form-container-user">
                    <AddUserForm
                        onClose={() => setShowModal(false)}
                        onUserAdded={() => fetchUsers(currentPage)}
                        user={editingUser}
                    />
                </div>
            )}

            <table className="user-table">
                <thead className="user-table-head">
                    <tr>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Телефон</th>
                        <th>Роль</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody className="user-table-body">
                    {users.map((user) => (
                        <tr key={user._id} className="user-table-row">
                            <td>{user.fullname}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{roleMapping[user.role] || user.role}</td>
                            <td>
                                <button
                                    className="edit-user-button"
                                    onClick={() => handleEditUser(user)}
                                >
                                    Редактировать
                                </button>
                                <button
                                    className="delete-user-button"
                                    onClick={() => handleDeleteUser(user._id)}
                                >
                                    Удалить
                                </button>
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
};

export default UserManagementPage;
