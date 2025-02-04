const User = require('../models/User');

// Получение всех пользователей
exports.getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    try {
        const users = await User.find().skip(skip).limit(limit);
        const total = await User.countDocuments();
        res.json({ users, total });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
};

// Получения всех пользователей, кроме студентов
exports.getAllTeacherManager = async (req, res) => {
    try {
        const users = await User.find({
            role: { $in: ['teacher', 'manager', 'admin'] },
        }).sort({
            fullname: 1,
        });
        if (!users.length) {
            return res.status(404).json({ message: 'Пользователи не найдены' });
        }
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({
            message: 'Ошибка при получении пользователей',
            error: error.message,
        });
    }
};

// Получение профиля пользователя
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id, '-password');
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении профиля' });
    }
};

// Обновление фото пользователя
exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не загружен' });
        }

        console.log('Файл загружен:', req.file);
        const photoPath = `${req.protocol}://${req.get('host')}/uploads/${
            req.file.filename
        }`;

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
        res.status(500).json({ message: 'Ошибка при обновлении фото' });
    }
};

// Изменение данных Пользователя
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullname, teacherInfo } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        if (fullname) user.fullname = fullname;

        if (teacherInfo) {
            const { gender, contacts } = teacherInfo;

            if (gender) user.teacherInfo.gender = gender;
            if (contacts) {
                const phoneContact = contacts.find((c) => c.type === 'phone');
                if (phoneContact) {
                    const existingPhoneContact = user.teacherInfo.contacts.find(
                        (c) => c.type === 'phone'
                    );
                    if (existingPhoneContact) {
                        existingPhoneContact.value = phoneContact.value;
                    } else {
                        user.teacherInfo.contacts.push(phoneContact);
                    }
                }
            }
        }

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

exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении пользователя' });
    }
};

exports.deleteUserById = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Пользователь успешно удален' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении пользователя' });
    }
};
