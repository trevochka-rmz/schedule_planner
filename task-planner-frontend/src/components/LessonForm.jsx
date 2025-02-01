import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import './LessonForm.css';

const LessonForm = ({ formType, selectedEvent, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        date: '',
        time: '10:00',
        duration: 60,
        location: formType === 'individual' ? 'Онлайн' : '',
        student: '',
        direction: '',
        teacher: '',
        theme: '',
        comment: '',
        commentAfter: '',
    });

    const [defaultTeacher, setDefaultTeacher] = useState(null);
    const [defaultStudent, setDefaultStudent] = useState(null);
    const [errors, setErrors] = useState([]);
    const [teachersOptions, setTeachersOptions] = useState([]);
    const [studentsOptions, setStudentsOptions] = useState([]);

    // Получение информации о студенте
    const getStudentInfo = async (studentId) => {
        const response = await fetch(
            `http://localhost:5000/api/users/student/${studentId}`
        );
        if (!response.ok) throw new Error('Ошибка получения данных студента');
        const student = await response.json();
        return student.studentInfo;
    };

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
                    teacher: currentUser.value,
                }));
                setDefaultTeacher(currentUser);
            }
        };

        const fetchStudents = async () => {
            const response = await axios.get(
                'http://localhost:5000/api/users/all-students'
            );
            const students = response.data.map((student) => ({
                label: student.fullname,
                value: student._id,
            }));
            setStudentsOptions(students);
        };

        fetchTeachers();
        fetchStudents();
    }, []);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser && currentUser.role === 'teacher') {
            setFormData((prev) => ({ ...prev, teacher: currentUser._id }));
            console.log(defaultTeacher);
            setDefaultTeacher({
                label: currentUser.fullname,
                value: currentUser._id,
            });
        }
    }, []);
    useEffect(() => {
        console.log(formType);
        if (
            (formType === 'edit' ||
                formType === 'mark' ||
                formType === 'editMark') &&
            selectedEvent
        ) {
            const { start, end, extendedProps } = selectedEvent;
            setFormData({
                date: new Date(start).toISOString().split('T')[0],
                time: new Date(start).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                duration: (new Date(end) - new Date(start)) / 60000,
                location: extendedProps.location || 'Онлайн',
                student: extendedProps.studentId,
                direction: extendedProps.direction,
                teacher: extendedProps.teacherId,
                theme: extendedProps.theme,
                comment: extendedProps.comment || '',
                commentAfter: extendedProps.commentAfter || '',
            });

            // Устанавливаем значение селектора преподавателя
            if (extendedProps.teacherID && extendedProps.teacher) {
                setDefaultTeacher({
                    label: extendedProps.teacher,
                    value: extendedProps.teacherID,
                });
            }

            // Устанавливаем значение селектора ученика
            if (extendedProps.studentID && extendedProps.student) {
                setDefaultStudent({
                    label: extendedProps.student,
                    value: extendedProps.studentID,
                });
            }
        }
    }, [formType, selectedEvent]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleStudentChange = async (selectedOption) => {
        try {
            setFormData({ ...formData, student: selectedOption.value });
            const studentInfo = await getStudentInfo(selectedOption.value);
            if (studentInfo && studentInfo.direction) {
                setFormData((prev) => ({
                    ...prev,
                    direction: studentInfo.direction,
                }));
            }
        } catch (error) {
            console.error('Ошибка получения информации о студенте:', error);
            setErrors([{ msg: 'Не удалось получить данные студента' }]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formType === 'edit') {
            await onSubmit(formData); // handleEditLesson из SchedulePage
        } else {
            console.log(formData);
            onSubmit(formData); // handleAddLesson из SchedulePage
        }
    };

    return (
        <form
            className={`lesson-form-main ${
                formType === 'mark' ? 'mark' : 'default'
            }`}
            onSubmit={handleSubmit}
        >
            {formType == 'add' ? (
                <h2 className="lesson-form-title">Добавить занятие</h2>
            ) : formType == 'edit' ? (
                <h2 className="lesson-form-title ">
                    Изменить запланированное занятие
                </h2>
            ) : formType == 'editMark' ? (
                <h2 className="lesson-form-title ">
                    Изменить проведенное занятие
                </h2>
            ) : (
                <h2 className="lesson-form-title ">Провести занятие</h2>
            )}

            {errors.length > 0 && (
                <div className="error-messages">
                    <ul>
                        {errors.map((error, index) => (
                            <li key={index}>{error.msg}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="form-group">
                <label>Дата:</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label>Время:</label>
                <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label>Длительность (мин.):</label>
                <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="30"
                />
            </div>
            <div className="form-group">
                <label>Локация:</label>
                <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Выберите локацию"
                >
                    <option value="Онлайн">Онлайн</option>
                    <option value="Кабинет 101">Кабинет 101</option>
                    <option value="Кабинет 202">Кабинет 202</option>
                </select>
            </div>
            <div className="form-group">
                <label>Клиент:</label>
                <Select
                    options={studentsOptions}
                    className="select-user"
                    name="student"
                    value={
                        studentsOptions.find(
                            (option) => option.value === formData.student
                        ) || defaultStudent
                    }
                    onChange={handleStudentChange}
                    placeholder="Выберите студента"
                    required
                />
            </div>
            <div className="form-group">
                <label>Направление:</label>
                <input
                    type="text"
                    name="direction"
                    value={formData.direction}
                    onChange={handleChange}
                    placeholder="Напишите направление"
                    required
                />
            </div>
            <div className="form-group">
                <label>Преподаватель:</label>
                <Select
                    options={teachersOptions}
                    name="teacher"
                    className="select-user"
                    value={
                        teachersOptions.find(
                            (option) => option.value === formData.teacher
                        ) || defaultTeacher
                    }
                    onChange={(selectedOption) =>
                        setFormData({
                            ...formData,
                            teacher: selectedOption.value,
                        })
                    }
                    placeholder="Выберите преподавателя"
                    required
                />
            </div>
            {formType === 'mark' || formType === 'editMark' ? (
                <div className="form-group">
                    <label>Тема:</label>
                    <input
                        type="text"
                        name="theme"
                        value={formData.theme}
                        onChange={handleChange}
                    />
                </div>
            ) : null}
            {formType == 'add' || formType == 'edit' ? (
                <div className="form-group">
                    <label>Комментарий к уроку:</label>
                    <textarea
                        name="comment"
                        value={formData.comment}
                        onChange={handleChange}
                    ></textarea>
                </div>
            ) : (
                <div className="form-group">
                    <label>Комментарий:</label>
                    <textarea
                        name="commentAfter"
                        value={formData.commentAfter}
                        onChange={handleChange}
                        placeholder="Напишите как прошло занятие"
                    ></textarea>
                </div>
            )}

            <div className="modal-buttons">
                <button type="submit">
                    {formType === 'edit'
                        ? 'Сохранить изменения'
                        : formType === 'add'
                        ? 'Добавить'
                        : 'Провести'}
                </button>

                <button type="button" onClick={onCancel}>
                    Отмена
                </button>
            </div>
        </form>
    );
};

const getCurrentUserIdFromToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    } catch (e) {
        console.error('Ошибка извлечения ID из токена:', e);
        return null;
    }
};

export default LessonForm;
