const User = require('../models/User');

// Получения всех преподавателей
exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await User.find(
            { role: 'teacher' },
            'fullname teacherInfo'
        ).sort({ fullname: 1 });
        if (!teachers.length) {
            return res
                .status(404)
                .json({ message: 'Преподаватели не найдены' });
        }
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({
            message: 'Ошибка при получении преподавателей',
        });
    }
};

// Получения преподавателя по Id
exports.getTeacherById = async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Преподаватель не найден' });
        }
        res.status(200).json(teacher);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении преподавателя' });
    }
};
