const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const teacherController = require('../controllers/teacherController');
const studentController = require('../controllers/studentController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/multer');

const router = express.Router();

// Маршруты для авторизации и регистрации
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/reset-password', protect, authController.resetPassword);
router.post('/change-password', protect, authController.changePassword);

// Маршруты для работы с профилем пользователя
router.get('/profile', protect, userController.getUserProfile);
router.post(
    '/profile/photo',
    protect,
    upload.single('photo'),
    userController.uploadPhoto
);
router.put('/profile', protect, userController.updateProfile);
router.put('/profile/:id', userController.updateUser);
router.delete('/profile/:id', userController.deleteUserById);

// Методы получения конкретных пользователей
router.get('/students', studentController.getAllStudentPages);
router.get('/students-all', studentController.getAllStudents);
router.get('/all-students', studentController.getAllStudentInput);
router.get('/teachers', teacherController.getAllTeachers);
router.get('/teacher-manager', userController.getAllTeacherManager);
router.get('/student/:id', studentController.getStudentById);
router.get('/teacher/:id', teacherController.getTeacherById);

router.get('/all', userController.getAllUsers);

module.exports = router;
