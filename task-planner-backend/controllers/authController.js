const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/keys');

// Создание JWT токена
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d', // Токен истекает через 30 дней
    });
};

// Регистрация пользователя
const registerUser = async (req, res) => {
    const { fullname, email, password, role } = req.body;

    try {
        // Проверка на уникальность email
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res
                .status(400)
                .json({ message: 'Этот email уже используется' });
        }

        // Создание нового пользователя
        const user = await User.create({
            fullname,
            email,
            password,
            role, // Роль можно задавать администратором
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                token: generateToken(user._id), // Возвращаем JWT токен
            });
        } else {
            res.status(400).json({
                message: 'Ошибка при создании пользователя',
            });
        }
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
    }
};

// Авторизация пользователя
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Поиск пользователя по email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                token: generateToken(user._id), // Возвращаем JWT токен
            });
        } else {
            res.status(401).json({ message: 'Неверный email или пароль' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
