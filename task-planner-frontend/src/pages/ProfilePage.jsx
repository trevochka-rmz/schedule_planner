import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfilePage.css';
import {
    getUserProfile,
    updateUserProfile,
    uploadUserPhoto,
    changeUserPassword,
    getTeacherSchedule,
} from '../api/apiUser';

const ProfilePage = () => {
    const [profile, setProfile] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [schedule, setSchedule] = useState([]);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [file, setFile] = useState(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await getUserProfile();
                setProfile(data);
                setFormData({
                    fullname: data.fullname || '',
                    gender: data.teacherInfo?.gender || '',
                    phone:
                        data.teacherInfo?.contacts?.find(
                            (contact) => contact.type === 'phone'
                        )?.value || '',
                    birthDate: data.teacherInfo?.birthDate || '',
                });
                const scheduleResponse = await getTeacherSchedule(data._id);
                console.log(scheduleResponse);
                setSchedule(scheduleResponse.data.lessons);
            } catch (error) {
                console.error('Ошибка загрузки данных профиля:', error);
            }
        };

        fetchProfile();
    }, []);

    const handleUpdate = async () => {
        try {
            setError('');
            setMessage('');
            // Формирование обновляемых данных
            const updatedData = {
                fullname: formData.fullname, // Обновление основного имени
                teacherInfo: {
                    gender: formData.gender, // Пол внутри teacherInfo
                    contacts: [
                        {
                            type: 'phone',
                            value: formData.phone, // Номер телефона внутри teacherInfo.contacts
                        },
                    ],
                },
            };

            // Отправка данных на сервер
            const response = await updateUserProfile(updatedData);
            if (response.status === 200) {
                // Обновление локального состояния профиля
                setProfile((prevProfile) => ({
                    ...prevProfile,
                    fullname: formData.fullname,
                    teacherInfo: {
                        ...prevProfile.teacherInfo,
                        gender: formData.gender,
                        contacts: updatedData.teacherInfo.contacts,
                    },
                }));
                setEditMode(false); // Выход из режима редактирования
                console.log('Данные успешно обновлены!');
            }
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
        }
    };

    const handleSavePassword = async () => {
        if (!passwordData.currentPassword) {
            setError('Введите текущий пароль.');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Пароли не совпадают!');
            return;
        }
        await handlePasswordChange(); // Вызываем метод для изменения пароля
    };

    const handlePasswordChange = async () => {
        // Проверка на длину нового пароля
        if (passwordData.newPassword.length < 6) {
            setError('Новый пароль должен содержать не менее 6 символов.');
            return;
        }

        try {
            const response = await changeUserPassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );

            if (response.status === 200) {
                alert('Пароль успешно изменён!');
                setError('');
                setMessage('');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
                setShowPasswordFields(false); // Скрываем поля для пароля
            } else {
                setError(
                    response.data.message || 'Не удалось изменить пароль.'
                );
            }
        } catch (error) {
            setError(err.response?.data?.message || 'Ошибка изменения пароля.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const handlePhotoClick = () => {
        document.getElementById('photoInput').click();
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            console.log('Выбран файл:', selectedFile.name); // Для отладки
            setFile(selectedFile);
            handlePhotoUpload(selectedFile);
        }
    };
    const handlePhotoUpload = async (file) => {
        try {
            const { data } = await uploadUserPhoto(file);
            setProfile({ ...profile, urlPhoto: data.urlPhoto });
        } catch (error) {
            console.error(
                'Ошибка загрузки фотографии:',
                error.response?.data || error.message
            );
            if (error.response?.status === 401) {
                alert('Вы не авторизованы. Пожалуйста, войдите в систему.');
            }
        }
    };

    return (
        <div className="profile-page">
            {/* Левый блок */}
            <div className="left-block">
                <div className="photo-block">
                    <img
                        src={
                            profile.urlPhoto ||
                            'https://via.placeholder.com/150'
                        }
                        alt="Фото профиля"
                        className="profile-pic"
                        onClick={handlePhotoClick}
                        title="Нажмите, чтобы загрузить фото"
                    />
                    <input
                        type="file"
                        id="photoInput"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>
                <div className="left-info-block">
                    <div className="profile-info">
                        <h2>{profile.fullname}</h2>
                        <p>
                            Дата рождения:{' '}
                            {profile.teacherInfo?.birthDate?.slice(0, 10) ||
                                '—'}
                        </p>
                        <p>
                            Пол:{' '}
                            {profile.teacherInfo?.gender === 'male'
                                ? 'Мужской'
                                : 'Женский'}
                        </p>
                        <p>
                            Телефон:{' '}
                            {profile.teacherInfo?.contacts?.find(
                                (c) => c.type === 'phone'
                            )?.value || '—'}
                        </p>
                    </div>

                    <button
                        onClick={() => setEditMode(!editMode)}
                        className="edit-button"
                    >
                        {editMode ? 'Скрыть' : 'Обновить информацию'}
                    </button>
                    {editMode && (
                        <div className="edit-form">
                            <input
                                type="text"
                                name="fullname"
                                value={formData.fullname}
                                onChange={handleInputChange}
                                placeholder="Имя"
                            />
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                            >
                                <option className="gender-input" value="">
                                    Выберите пол
                                </option>
                                <option className="gender-input" value="male">
                                    Мужской
                                </option>
                                <option className="gender-input" value="female">
                                    Женский
                                </option>
                            </select>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Телефон"
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={showPasswordFields}
                                    onChange={() =>
                                        setShowPasswordFields(
                                            !showPasswordFields
                                        )
                                    }
                                />
                                Сменить пароль<br></br>
                            </label>
                            {showPasswordFields && (
                                <div className="password-form">
                                    {error && <p className="error">{error}</p>}
                                    {message && (
                                        <p className="success">{message}</p>
                                    )}
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        placeholder="Текущий пароль"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordInputChange}
                                    />
                                    <input
                                        type="password"
                                        name="newPassword"
                                        placeholder="Новый пароль"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordInputChange}
                                    />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Подтвердите пароль"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordInputChange}
                                    />
                                </div>
                            )}
                            {showPasswordFields ? (
                                <button
                                    onClick={handleSavePassword}
                                    className="save-button"
                                >
                                    Сменить пароль
                                </button>
                            ) : (
                                <button
                                    onClick={handleUpdate}
                                    className="save-button"
                                >
                                    Сохранить изменения
                                </button>
                            )}
                            <button
                                onClick={() => setEditMode(false)}
                                className="cancel-button"
                            >
                                Отмена
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Правый блок */}
            <div className="right-block">
                <h3>Контакты</h3>
                <table className="profile-table">
                    <tbody>
                        <tr>
                            <th>Телефон:</th>
                            <td>
                                {profile.teacherInfo?.contacts?.find(
                                    (c) => c.type === 'phone'
                                )?.value || '—'}
                            </td>
                        </tr>
                        <tr>
                            <th>Email:</th>
                            <td>{profile.email || '—'}</td>
                        </tr>
                    </tbody>
                </table>
                <h3>Проведено уроков</h3>
                <p>{profile.teacherInfo?.lessonsGiven || 0}</p>
            </div>

            {/* Секция расписания */}
            <div className="schedule-section">
                <h3>Ближайшие уроки</h3>
                {schedule.length > 0 ? (
                    <ul>
                        {schedule
                            .sort(
                                (a, b) => new Date(a.start) - new Date(b.start)
                            ) // Сортировка по дате
                            .slice(0, 5) // Берем только ближайшие 5 занятий
                            .map((lesson, index) => (
                                <li key={index}>
                                    <strong>{lesson.title}</strong> <br />
                                    Дата:{' '}
                                    {new Date(
                                        lesson.start
                                    ).toLocaleString()}{' '}
                                    <br />
                                    Продолжительность:{' '}
                                    {Math.round(
                                        (new Date(lesson.end) -
                                            new Date(lesson.start)) /
                                            60000
                                    )}{' '}
                                    мин
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p>Нет предстоящих уроков</p>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
