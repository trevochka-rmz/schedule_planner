const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const {
    getUserProfile,
    getAllUsers,
    addUser,
    getAllStudent,
    uploadPhoto,
    updateProfile,
    changePassword,
    resetPassword,
    getAllTeacher,
    getTeacherByID,
    updateUser,
    deleteUserById,
    getAllStudentPages,
    getStudentById,
    getAllTeacherManager,
    getAllStudentInput,
} = require('../controllers/userController');
const { protect, roleCheck } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/multer');
const {
    validateUserRegistration,
    validateLesson,
    handleValidationErrors,
} = require('../utils/validators');

const router = express.Router();

// Маршруты для авторизации и регистрации
router.post(
    '/register',
    // validateUserRegistration,
    // handleValidationErrors,
    registerUser
); // Регистрация пользователя
router.post('/login', loginUser); // Авторизация пользователя
router.post('/reset-password', resetPassword); // Сброс пароля

// Маршруты для работы с профилем пользователя
router.get('/profile', protect, getUserProfile); // Получение профиля авторизованного пользователя
router.post('/profile/photo', protect, upload.single('photo'), uploadPhoto); // Маршрут для загрузки фотографии
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

router.put('/profile/:id', updateUser); // Обновление данных у пользователя
router.delete('/profile/:id', deleteUserById); // Удаление пользователя

router.get('/students', getAllStudentPages); // Получение всех студентов
router.get('/students-all', getAllStudent); // Получение всех студентов
router.get('/all-students', getAllStudentInput); // Получение всех студентов
router.get('/teachers', getAllTeacher); // Получение всех преподавателей

router.get('/teacher-manager', getAllTeacherManager); // Получение всех, кроме студентов

router.get('/student/:id', getStudentById); // Получение студента по id
router.get('/teacher/:id', getTeacherByID); // Получение студента по id

// Административные маршруты
router.get('/all', getAllUsers); // Получение всех пользователей (для администратора)

//router.post('/add', protect, roleCheck(['admin']), addUser); // Добавление нового пользователя (например, учителя или ученика)
router.post('/add', addUser); // Добавление нового пользователя (например, учителя или ученика)

module.exports = router;
