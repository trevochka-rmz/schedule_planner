import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import axios from 'axios';
import './AddRegularGroupLessonModal.css';
import { useParams } from 'react-router-dom';

Modal.setAppElement('#root'); // Для обеспечения доступности

function AddRegularGroupLessonModal({ isOpen, onClose, onSuccess }) {
    const { id: defaultGroupId } = useParams();
    const [formData, setFormData] = useState({
        teacherId: '',
        groupId: defaultGroupId || '',
        direction: '',
        startTime: '10:00',
        duration: '60',
        location: 'онлайн',
        dayOfWeek: '',
        periodStart: '',
        periodEnd: '',
    });
    const [groupOptions, setGroupOptions] = useState([]);
    const [teachersOptions, setTeachersOptions] = useState([]);
    const [error, setError] = useState(''); // Состояние для хранения текста ошибки

    useEffect(() => {
        const fetchTeachers = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const response = await axios.get(
                'http://localhost:5000/api/users/teachers',
                config
            );
            const teachers = response.data.map((teacher) => ({
                label: teacher.fullname,
                value: teacher._id,
            }));
            setTeachersOptions(teachers);

            const currentUserId = getCurrentUserIdFromToken(token);
            const currentUser = teachers.find((t) => t.value === currentUserId);
            if (currentUser) {
                setFormData((prev) => ({
                    ...prev,
                    teacherId: currentUser.value,
                }));
            }
        };

        const fetchGroups = async () => {
            const response = await axios.get(
                'http://localhost:5000/api/group/groups'
            );
            console.log(response.data.groups);
            const groups = response.data.groups.map((group) => ({
                label: group.name,
                value: group._id,
            }));
            setGroupOptions(groups);
        };

        fetchTeachers();
        fetchGroups();
    }, []);

    const handleSelectChange = (selectedOption, actionMeta) => {
        setFormData({ ...formData, [actionMeta.name]: selectedOption.value });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Сбрасываем ошибку перед запросом
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const convertToISOWithTime = (dateString) => {
                const date = new Date(dateString);
                date.setUTCHours(9, 0, 0, 0);
                return date.toISOString();
            };

            const requestData = {
                ...formData,
                periodStart: convertToISOWithTime(formData.periodStart),
                periodEnd: convertToISOWithTime(formData.periodEnd),
            };

            await axios.post(
                'http://localhost:5000/api/regular/create-group',
                requestData,
                config
            );

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Ошибка при добавлении группы:', error);
            setError(
                error.response?.data?.message ||
                    'Произошла ошибка. Попробуйте снова.'
            );
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="add-regular-lesson-modal"
            overlayClassName="add-regular-lesson-overlay"
        >
            <h2>Добавить регулярное групповое занятие</h2>
            {error && <p className="error-message">{error}</p>}{' '}
            {/* Отображение ошибки */}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Преподаватель:</label>
                    <Select
                        options={teachersOptions}
                        name="teacherId"
                        value={teachersOptions.find(
                            (option) => option.value === formData.teacherId
                        )}
                        onChange={handleSelectChange}
                        isDisabled
                    />
                </div>
                <div>
                    <label>Группа:</label>
                    <Select
                        options={groupOptions}
                        name="groupId"
                        value={groupOptions.find(
                            (option) => option.value === formData.groupId
                        )}
                        onChange={handleSelectChange}
                        placeholder="Выберите группу"
                        required
                        isDisabled
                    />
                </div>
                <div>
                    <label>Направление:</label>
                    <input
                        type="text"
                        name="direction"
                        value={formData.direction}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Время начала:</label>
                    <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        min="09:00"
                        max="23:00"
                        required
                    />
                </div>
                <div>
                    <label>Длительность (мин):</label>
                    <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Место:</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>День недели:</label>
                    <select
                        name="dayOfWeek"
                        value={formData.dayOfWeek}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Выберите день
                        </option>
                        <option value="1">Понедельник</option>
                        <option value="2">Вторник</option>
                        <option value="3">Среда</option>
                        <option value="4">Четверг</option>
                        <option value="5">Пятница</option>
                        <option value="6">Суббота</option>
                        <option value="0">Воскресенье</option>
                    </select>
                </div>
                <div className="form-row">
                    <label>Период:</label>
                    <div className="period-row">
                        <input
                            type="date"
                            name="periodStart"
                            value={formData.periodStart}
                            onChange={handleChange}
                            required
                        />
                        <span>—</span>
                        <input
                            type="date"
                            name="periodEnd"
                            value={formData.periodEnd}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="modal-buttons">
                    <button type="submit">Добавить</button>
                    <button type="button" onClick={onClose}>
                        Отмена
                    </button>
                </div>
            </form>
        </Modal>
    );
}

const getCurrentUserIdFromToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Декодируем JWT
        return payload.id;
    } catch (e) {
        console.error('Ошибка извлечения ID из токена:', e);
        return null;
    }
};

export default AddRegularGroupLessonModal;
