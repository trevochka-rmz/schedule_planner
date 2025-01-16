const { check, validationResult } = require('express-validator');

// Валидация регистрации пользователя
const validateUserRegistration = [
    check('fullname')
        .trim()
        .notEmpty()
        .withMessage('Полное имя обязательно')
        .isLength({ min: 3 })
        .withMessage('Имя должно содержать не менее 3 символов'),
    check('email').isEmail().withMessage('Некорректный формат email'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Пароль должен содержать не менее 6 символов'),
    check('role')
        .isIn(['student', 'teacher', 'manager', 'admin'])
        .withMessage('Некорректная роль'),
];

// Валидация добавления урока
const validateLesson = [
    check('lessonData.student')
        .notEmpty()
        .withMessage('ID студента обязательно')
        .isMongoId()
        .withMessage('Некорректный формат ID студента'),
    check('lessonData.teacher')
        .notEmpty()
        .withMessage('ID преподавателя обязательно')
        .isMongoId()
        .withMessage('Некорректный формат ID преподавателя'),
    check('lessonData.direction')
        .notEmpty()
        .withMessage('Направление обязательно'),
    check('lessonData.date')
        .notEmpty()
        .withMessage('Дата обязательна')
        .isISO8601()
        .withMessage('Некорректный формат даты'),
    check('lessonData.time')
        .notEmpty()
        .withMessage('Время обязательно')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('Время должно быть в формате HH:mm'),
    check('lessonData.duration')
        .notEmpty()
        .withMessage('Продолжительность обязательна')
        .isInt({ min: 30, max: 180 })
        .withMessage('Продолжительность должна быть от 30 до 180 минут'),
];

// Обработчик ошибок валидации
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateUserRegistration,
    validateLesson,
    handleValidationErrors,
};
