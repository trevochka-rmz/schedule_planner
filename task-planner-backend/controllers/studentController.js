const User = require('../models/User');

// Получения всех студентов
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find(
            { role: 'student' },
            'fullname email phone studentInfo'
        ).sort({ fullname: 1 });
        if (!students.length) {
            return res.status(404).json({ message: 'Студенты не найдены' });
        }
        res.status(200).json({ students });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении студентов' });
    }
};

// Получения студента по Id
exports.getStudentById = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Студент не найден' });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении студента' });
    }
};

// Получения всех студентов для поиска
exports.getAllStudentInput = async (req, res) => {
    try {
        const students = await User.find(
            { role: 'student' },
            'fullname studentInfo'
        ).sort({ fullname: 1 });

        if (!students.length) {
            return res.status(404).json({ message: 'Студенты не найдены' });
        }

        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении студентов' });
    }
};

// Получения всех студентов с пагинацией
exports.getAllStudentPages = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    try {
        const students = await User.find(
            { role: 'student' },
            'fullname email phone studentInfo'
        )
            .sort({ fullname: 1 })
            .skip(skip)
            .limit(limit);
        const total = await User.countDocuments({ role: 'student' });

        res.status(200).json({ students, total });
    } catch (error) {
        res.status(500).json({
            message: 'Ошибка при получении студентов',
            error: error.message,
        });
    }
};
