const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/keys');
const {
    sendEmailToHTML,
    generateEmailHtml,
    saveUserToExcel,
} = require('../utils/sendEmail');

// Создание JWT токена
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d', // Токен истекает через 30 дней
    });
};

const generateUniqueLogin = async (fullname) => {
    const usernameBase = fullname.split(' ')[0].toLowerCase();
    let uniqueLogin;
    let isUnique = false;

    while (!isUnique) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Генерируем случайное число
        uniqueLogin = `${usernameBase}${randomSuffix}`;

        // Проверяем, существует ли такой логин в базе данных
        const existingUser = await User.findOne({ login: uniqueLogin });
        if (!existingUser) {
            isUnique = true; // Логин уникален
        }
    }

    return uniqueLogin;
};

// Регистрация пользователя
const registerUser = async (req, res) => {
    const {
        fullname,
        email,
        phone,
        role,
        studentInfo,
        teacherInfo,
        managerInfo,
        sendCredentials,
    } = req.body;

    try {
        if (!email && !phone) {
            return res.status(400).json({
                message: 'Необходимо указать хотя бы email или номер телефона.',
            });
        }

        // Проверка уникальности email (если email не пустой)
        if (email.trim() !== '') {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({
                    message: 'Этот email уже используется.',
                });
            }
        }

        // Проверка уникальности phone (если phone не пустой)
        if (phone.trim() !== '') {
            const phoneExists = await User.findOne({ phone });
            if (phoneExists) {
                return res.status(400).json({
                    message: 'Этот номер телефона уже используется.',
                });
            }
        }

        const login = await generateUniqueLogin(fullname);
        const randomPassword = Math.random().toString(36).slice(-8);

        // Создание нового пользователя
        const user = await User.create({
            fullname,
            email,
            phone,
            password: randomPassword,
            role,
            login,
        });

        if (role === 'student' && studentInfo) {
            user.studentInfo = studentInfo;
        }
        if (role === 'teacher' && teacherInfo) {
            user.teacherInfo = teacherInfo;
        }
        if (role === 'manager' && managerInfo) {
            user.managerInfo = managerInfo;
        }

        // Сохранение пользователя в базе данных
        await user.save();

        if (user) {
            if (sendCredentials && email.trim() !== '') {
                await sendEmailToHTML(
                    email,
                    'Ваши учетные данные',
                    generateEmailHtml(fullname, login, email, randomPassword)
                );
            }

            saveUserToExcel({
                fullname,
                login,
                email: email || '',
                phone: phone || '',
                role,
                randomPassword,
            });

            res.status(201).json({
                _id: user.id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                login: user.login,
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
    const { identifier, password } = req.body;

    try {
        // Поиск пользователя либо по email, либо по логину (username)
        const user = await User.findOne({
            $or: [{ email: identifier }, { login: identifier }], // Ищем по двум полям
        });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                fullname: user.fullname,
                email: user.email,
                login: user.login, // Если у пользователя есть имя пользователя
                role: user.role,
                token: generateToken(user._id), // Возвращаем JWT токен
            });
        } else {
            res.status(401).json({ message: 'Неверный логин или пароль' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
