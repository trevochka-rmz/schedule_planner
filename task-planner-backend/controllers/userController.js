const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
// Получение всех пользователей (только для администратора)
const getAllUsers = async (req, res) => {
    try {
        //const users = await User.find({}, '-password'); // Убираем поле пароля из результатов
        const users = await User.find({}); // Убираем поле пароля из результатов
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении пользователей' });
    }
};

const getAllStudent = async (req, res) => {
    try {
        const students = await User.find(
            { role: 'student' }, // Условие: только студенты
            'fullname studentInfo' // Поля, которые нужно вернуть
        ).sort({ fullname: 1 }); // Сортировка по полному имени (в алфавитном порядке)

        if (!students.length) {
            return res.status(404).json({ message: 'Студенты не найдены' });
        }

        res.status(200).json(students);
    } catch (error) {
        console.error('Ошибка при получении студентов:', error);
        res.status(500).json({ error: 'Ошибка при получении студентов' });
    }
};

const getAllTeacher = async (req, res) => {
    try {
        const teachers = await User.find(
            { role: 'teacher' }, // Условие: только студенты
            'fullname teacherInfo' // Поля, которые нужно вернуть
        ).sort({ fullname: 1 }); // Сортировка по полному имени (в алфавитном порядке)

        if (!teachers.length) {
            return res
                .status(404)
                .json({ message: 'Преподаватели не найдены' });
        }

        res.status(200).json(teachers);
    } catch (error) {
        console.error('Ошибка при получении преподавателй:', error);
        res.status(500).json({ error: 'Ошибка при получении преподавателй' });
    }
};
const getStudentById = async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select(
            'studentInfo'
        );
        if (!student) {
            return res.status(404).json({ message: 'Студент не найден' });
        }
        res.status(200).json(student);
    } catch (error) {
        console.error('Ошибка получения студента:', error);
        res.status(500).json({ error: 'Ошибка при получении студента' });
    }
};

// Добавление нового пользователя (только для администратора)
const addUser = async (req, res) => {
    const { fullname, email, role, studentInfo, teacherInfo, managerInfo } =
        req.body;

    try {
        // Проверка на существование пользователя с таким email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: 'Пользователь с таким email уже существует' });
        }

        // Генерация случайного пароля
        const randomPassword = Math.random().toString(36).slice(-8);

        // Создание нового пользователя с базовыми данными
        const newUser = new User({
            fullname,
            email,
            password: randomPassword,
            role,
        });

        // Добавление специфичной информации в зависимости от роли
        if (role === 'student' && studentInfo) {
            newUser.studentInfo = studentInfo;
        }
        if (role === 'teacher' && teacherInfo) {
            newUser.teacherInfo = teacherInfo;
        }
        if (role === 'manager' && managerInfo) {
            newUser.managerInfo = managerInfo;
        }

        // Сохранение пользователя в базе данных
        await newUser.save();

        res.status(201).json({
            message: 'Пользователь успешно добавлен',
            user: {
                id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                role: newUser.role,
                ...(role === 'student' && { studentInfo: newUser.studentInfo }),
                ...(role === 'teacher' && { teacherInfo: newUser.teacherInfo }),
                ...(role === 'manager' && { managerInfo: newUser.managerInfo }),
            },
            generatedPassword: randomPassword,
        });
    } catch (error) {
        console.error('Ошибка при добавлении пользователя:', error);
        res.status(500).json({ message: 'Ошибка при добавлении пользователя' });
    }
};

// Получение профиля пользователя
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // Убираем пароль из ответа
        //const user = await User.findById(req.user.id, '-password'); // Убираем пароль из ответа
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении профиля' });
    }
};

const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не загружен' });
        }

        console.log('Файл загружен:', req.file);

        // Формируем полный URL для файла
        const photoPath = `${req.protocol}://${req.get('host')}/uploads/${
            req.file.filename
        }`;

        // Обновляем профиль пользователя
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { urlPhoto: photoPath },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.status(200).json({
            message: 'Фотография успешно обновлена',
            urlPhoto: user.urlPhoto,
        });
    } catch (error) {
        console.error('Ошибка при обновлении фото:', error);
        res.status(500).json({ message: 'Ошибка при обновлении фото' });
    }
};

// Изменение данных Пользователя
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Получаем ID пользователя из токена
        const { fullname, teacherInfo } = req.body; // Извлекаем данные из teacherInfo

        // Обновление пользователя
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Обновляем общую информацию
        if (fullname) user.fullname = fullname;

        // Проверяем, есть ли данные для teacherInfo
        if (teacherInfo) {
            const { gender, contacts } = teacherInfo;

            // Обновляем пол
            if (gender) user.teacherInfo.gender = gender;

            // Обновляем телефон в контактах
            if (contacts) {
                const phoneContact = contacts.find((c) => c.type === 'phone');
                if (phoneContact) {
                    const existingPhoneContact = user.teacherInfo.contacts.find(
                        (c) => c.type === 'phone'
                    );
                    if (existingPhoneContact) {
                        existingPhoneContact.value = phoneContact.value; // Обновляем
                    } else {
                        user.teacherInfo.contacts.push(phoneContact); // Добавляем
                    }
                }
            }
        }

        // Сохраняем изменения
        await user.save();

        res.status(200).json({
            message: 'Профиль обновлен',
            user,
        });
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        res.status(500).json({ message: 'Ошибка обновления профиля' });
    }
};

// Метод для смены
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const userId = req.user.id; // Получаем ID из токена
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Проверка текущего пароля
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный текущий пароль' });
        }

        // Валидация нового пароля (например, длина)
        if (newPassword.length < 6) {
            return res
                .status(400)
                .json({ message: 'Пароль должен быть не менее 6 символов.' });
        }

        // Установка нового пароля (без хэширования вручную)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Пароль успешно изменен' });
    } catch (error) {
        console.error('Ошибка изменения пароля:', error);
        res.status(500).json({ message: 'Ошибка изменения пароля' });
    }
};
// Контроллер для сброса пароля
const resetPassword = async (req, res) => {
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

        // Генерируем новый пароль
        const newPassword = crypto.randomBytes(8).toString('hex');

        // Устанавливаем новый пароль (без хэширования)
        user.password = newPassword;
        await user.save();

        // Отправляем письмо с новым паролем
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

const getTeacherByID = async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id);
        console.log(teacher);
        if (!teacher) {
            return res.status(404).json({ message: 'Преподаватель не найден' });
        }
        res.status(200).json(teacher);
    } catch (error) {
        console.error('Ошибка получения ID преподавателя:', error);
        res.status(500).json({
            message: 'Ошибка на сервере',
            error: error.message,
        });
    }
};

module.exports = {
    getAllUsers,
    addUser,
    getUserProfile,
    getAllStudent,
    uploadPhoto,
    updateProfile,
    changePassword,
    resetPassword,
    getAllTeacher,
    getStudentById,
    getTeacherByID,
};
