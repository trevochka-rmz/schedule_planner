import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import './AddUserForm.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { notifySuccess, notifyError } from '../../utils/notification.js';
const AddUserForm = ({ onClose, onUserAdded, user = null }) => {
    // Начальные значения формы
    const initialValues = user || {
        fullname: '',
        email: '',
        phone: '',
        role: '',
        studentInfo: {
            birthDate: '',
            gender: '',
            direction: '',
            lessonPrice: 900,
            lessonsCompleted: 0,
            lessonsRemaining: 0,
            isActive: true,
            description: '',
            groups: [],
        },
        teacherInfo: {
            birthDate: '',
            gender: '',
            salary: 0,
            lessonsGiven: 0,
        },
        managerInfo: {
            birthDate: '',
            gender: '',
            studentsAssigned: [],
            department: 'management',
        },
        sendCredentials: false,
    };

    // Валидация с помощью Yup
    const validationSchema = Yup.object()
        .shape({
            fullname: Yup.string().required('Полное имя обязательно'),
            email: Yup.string()
                .email('Некорректный email')
                .nullable()
                .notRequired(),
            phone: Yup.string()
                .matches(
                    /^\+?[1-9]\d{1,14}$/,
                    'Введите корректный номер телефона с международным кодом'
                )
                .notRequired(),
            role: Yup.string().required('Роль обязательна'),
            studentInfo: Yup.object().shape({
                birthDate: Yup.date().nullable(),
                gender: Yup.string().oneOf(
                    ['male', 'female'],
                    'Некорректный пол'
                ),
                direction: Yup.string(),
            }),
            teacherInfo: Yup.object().shape({
                birthDate: Yup.date().nullable(),
                gender: Yup.string().oneOf(
                    ['male', 'female'],
                    'Некорректный пол'
                ),
            }),
            managerInfo: Yup.object().shape({
                birthDate: Yup.date().nullable(),
                gender: Yup.string().oneOf(
                    ['male', 'female'],
                    'Некорректный пол'
                ),
            }),
        })
        .test(
            'email-or-phone',
            'Необходимо указать email или номер телефона',
            (values) => {
                return !!values.email || !!values.phone;
            }
        );

    const onSubmitUser = async (values, { resetForm }) => {
        try {
            console.log('Отправляем данные:', values); // Логируем данные перед отправкой
            if (user) {
                // Обновление пользователя
                await axios.put(
                    `http://localhost:5000/api/users/profile/${user._id}`,
                    values
                );
                notifySuccess('Пользователь успешно обновлен!');
            } else {
                // Добавление нового пользователя
                await axios.post(
                    'http://localhost:5000/api/users/register',
                    values
                );
                notifySuccess('Пользователь успешно добавлен!');
            }
            resetForm();
            onUserAdded();
            onClose();
        } catch (error) {
            console.error('Ошибка при добавлении пользователя:', error);
            notifyError('Ошибка сервера');
        }
    };
    return (
        <div className="add-user-form-container">
            <h1 className="form-title">
                {user
                    ? 'Редактирование пользователя'
                    : 'Добавление пользователя'}
            </h1>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmitUser}
            >
                {({ values, setFieldValue }) => (
                    <Form className="form">
                        <div className="form-group">
                            <label className="form-label">Полное имя</label>
                            <Field
                                type="text"
                                name="fullname"
                                className="form-input"
                            />
                            <ErrorMessage
                                name="fullname"
                                component="div"
                                className="form-error"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <Field
                                type="email"
                                name="email"
                                className="form-input"
                                inputMode="email"
                            />
                            <ErrorMessage
                                name="email"
                                component="div"
                                className="form-error"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Телефон</label>
                            <PhoneInput
                                country={'ru'}
                                value={values.phone}
                                onChange={(phone) =>
                                    setFieldValue('phone', phone)
                                }
                                inputClass="form-control"
                                containerClass="form-input-phone"
                                inputProps={{
                                    name: 'phone',
                                    required: false,
                                    autoFocus: true,
                                }}
                            />
                            <ErrorMessage
                                name="phone"
                                component="div"
                                className="form-error"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Роль</label>
                            <Field
                                as="select"
                                name="role"
                                className="form-select"
                            >
                                <option value="" label="Выберите роль" />
                                <option value="student" label="Ученик" />
                                <option value="teacher" label="Учитель" />
                                <option value="manager" label="Менеджер" />
                                <option value="admin" label="Администратор" />
                            </Field>
                            <ErrorMessage
                                name="role"
                                component="div"
                                className="form-error"
                            />
                        </div>

                        {values.role === 'student' && (
                            <div className="form-section">
                                <h3 className="form-section-title">
                                    Информация об ученике
                                </h3>
                                <div className="form-group">
                                    <label className="form-label">
                                        Дата рождения
                                    </label>
                                    <Field
                                        type="date"
                                        name="studentInfo.birthDate"
                                        // value={
                                        //     initialValues.studentInfo
                                        //         .birthDate || ''
                                        // }
                                        className="form-input"
                                    />
                                    <ErrorMessage
                                        name="studentInfo.birthDate"
                                        component="div"
                                        className="form-error"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Пол</label>
                                    <Field
                                        as="select"
                                        name="studentInfo.gender"
                                        className="form-select"
                                    >
                                        <option value="" label="Выберите пол" />
                                        <option value="male" label="Мужской" />
                                        <option
                                            value="female"
                                            label="Женский"
                                        />
                                    </Field>
                                    <ErrorMessage
                                        name="studentInfo.gender"
                                        component="div"
                                        className="form-error"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Направление обучения
                                    </label>
                                    <Field
                                        type="text"
                                        name="studentInfo.direction"
                                        className="form-input"
                                    />
                                    <ErrorMessage
                                        name="studentInfo.direction"
                                        component="div"
                                        className="form-error"
                                    />
                                </div>
                            </div>
                        )}

                        {values.role === 'teacher' && (
                            <div className="form-section">
                                <h3 className="form-section-title">
                                    Информация об учителе
                                </h3>
                                <div className="form-group">
                                    <label className="form-label">
                                        Дата рождения
                                    </label>
                                    <Field
                                        type="date"
                                        name="teacherInfo.birthDate"
                                        className="form-input"
                                        // value={
                                        //     initialValues.teacherInfo
                                        //         .birthDate || ''
                                        // }
                                    />
                                    <ErrorMessage
                                        name="teacherInfo.birthDate"
                                        component="div"
                                        className="form-error"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Пол</label>
                                    <Field
                                        as="select"
                                        name="teacherInfo.gender"
                                        className="form-select"
                                    >
                                        <option value="" label="Выберите пол" />
                                        <option value="male" label="Мужской" />
                                        <option
                                            value="female"
                                            label="Женский"
                                        />
                                    </Field>
                                    <ErrorMessage
                                        name="teacherInfo.gender"
                                        component="div"
                                        className="form-error"
                                    />
                                </div>
                            </div>
                        )}
                        {values.role === 'manager' && (
                            <div className="form-section">
                                <h3 className="form-section-title">
                                    Информация о менеджере
                                </h3>
                                <div className="form-group">
                                    <label className="form-label">
                                        Дата рождения
                                    </label>
                                    <Field
                                        type="date"
                                        name="managerInfo.birthDate"
                                        className="form-input"
                                        // value={
                                        //     initialValues.managerInfo
                                        //         .birthDate || ''
                                        // }
                                    />
                                    <ErrorMessage
                                        name="managerInfo.birthDate"
                                        component="div"
                                        className="form-error"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Пол</label>
                                    <Field
                                        as="select"
                                        name="managerInfo.gender"
                                        className="form-select"
                                    >
                                        <option value="" label="Выберите пол" />
                                        <option value="male" label="Мужской" />
                                        <option
                                            value="female"
                                            label="Женский"
                                        />
                                    </Field>
                                    <ErrorMessage
                                        name="managerInfo.gender"
                                        component="div"
                                        className="form-error"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-checkbox-label">
                                <Field
                                    type="checkbox"
                                    name="sendCredentials"
                                    className="form-checkbox"
                                />
                                Данные отправить на почту
                            </label>
                        </div>
                        <button type="submit" className="form-submit-button">
                            {user
                                ? 'Сохранить изменения'
                                : 'Добавить пользователя'}
                        </button>
                        <button
                            type="button"
                            className="form-cancel-button"
                            onClick={onClose}
                        >
                            Отмена
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddUserForm;
