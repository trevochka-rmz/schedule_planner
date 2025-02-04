const User = require('../models/User');
const { sendEmailToHTML, generateEmailHtml } = require('../utils/sendEmail');
const { generateUniqueLogin, generateToken } = require('../utils/authUtil');
const { saveUserToExcel } = require('../utils/saveData');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');

// Регистрация пользователя
exports.registerUser = async (req, res) => {
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

        if (email.trim() !== '') {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({
                    message: 'Этот email уже используется.',
                });
            }
        }
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
        await user.save();
        if (!user) {
            res.status(400).json({
                message: 'Ошибка при создании пользователя',
            });
        }
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
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
    }
};

// Авторизация пользователя
exports.loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const user = await User.findOne({
            $or: [{ email: identifier }, { login: identifier }],
        });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                fullname: user.fullname,
                email: user.email,
                login: user.login,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Неверный логин или пароль' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
    }
};

// Метод для смены
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный текущий пароль' });
        }
        if (newPassword.length < 6) {
            return res
                .status(400)
                .json({ message: 'Пароль должен быть не менее 6 символов.' });
        }
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Пароль успешно изменен' });
    } catch (error) {
        console.error('Ошибка изменения пароля:', error);
        res.status(500).json({ message: 'Ошибка изменения пароля' });
    }
};

// Метод для сброса пароля
exports.resetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email обязателен' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ message: 'Пользователь с таким email не найден' });
        }

        const newPassword = crypto.randomBytes(8).toString('hex');

        user.password = newPassword;
        await user.save();

        const subject = 'Ваш новый пароль';
        const message = `Ваш новый пароль: ${newPassword}`;

        await sendEmail(user.email, subject, message);

        res.status(200).json({
            message: 'Новый пароль отправлен на ваш email',
        });
    } catch (error) {
        console.error('Ошибка сброса пароля:', error);
        res.status(500).json({
            message: 'Ошибка на сервере',
            error: error.message,
        });
    }
};
