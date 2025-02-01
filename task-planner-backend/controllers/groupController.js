const Group = require('../models/Group');
const User = require('../models/User');

// Создание новой группы
exports.createGroup = async (req, res) => {
    try {
        const {
            name,
            teacher,
            students,
            direction,
            description,
            day,
            time,
            linkToChat,
            limit,
            location,
        } = req.body;

        // Проверка, существует ли указанный преподаватель
        const teacherExists = await User.findById(teacher);
        if (!teacherExists || teacherExists.role !== 'teacher') {
            return res
                .status(400)
                .json({ message: 'Некорректный преподаватель' });
        }

        // Проверка студентов
        const validStudents = await User.find({
            _id: { $in: students },
            role: 'student',
        });
        if (validStudents.length !== students.length) {
            return res
                .status(400)
                .json({ message: 'Некорректные студенты в группе' });
        }

        const newGroup = new Group({
            name,
            teacher,
            students,
            direction,
            description,
            limit,
            day,
            time,
            linkToChat,
            location,
        });
        await newGroup.save();

        res.status(201).json({
            message: 'Группа успешно создана',
            group: newGroup,
        });
    } catch (error) {
        console.error('Ошибка при создании группы:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Получение информации о конкретной группе
exports.getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('teacher', 'fullname')
            .populate('students', 'fullname');

        if (!group) {
            return res.status(404).json({ message: 'Группа не найдена' });
        }

        res.status(200).json({ group });
    } catch (error) {
        console.error('Ошибка при получении группы:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Обновление группы
exports.updateGroup = async (req, res) => {
    try {
        const {
            name,
            teacher,
            students,
            direction,
            linkToChat,
            description,
            day,
            time,
            location,
            isActive,
            limit,
        } = req.body;

        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Группа не найдена' });
        }

        group.name = name || group.name;
        group.teacher = teacher || group.teacher;
        group.students = students || group.students;
        group.direction = direction || group.direction;
        group.description = description || group.description;
        group.day = day || group.day;
        group.time = time || group.time;
        group.location = location || group.location;
        group.linkToChat = linkToChat || group.linkToChat;
        group.limit = limit || group.limit;
        group.isActive = isActive !== undefined ? isActive : group.isActive;

        await group.save();

        res.status(200).json({ message: 'Группа успешно обновлена', group });
    } catch (error) {
        console.error('Ошибка при обновлении группы:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Удаление группы
exports.deleteGroup = async (req, res) => {
    try {
        await Group.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Группа успешно удалена' });
    } catch (error) {
        console.error('Ошибка при удалении группы:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
// Добавление студента в группу
exports.addStudentToGroup = async (req, res) => {
    try {
        const { groupId, studentId } = req.params;

        // Проверка существования группы
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Группа не найдена' });
        }

        // Проверка существования студента
        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(400).json({ message: 'Некорректный студент' });
        }

        // Проверка, если студент уже в группе
        if (group.students.includes(studentId)) {
            return res
                .status(400)
                .json({ message: 'Студент уже находится в группе' });
        }

        // Добавление студента
        group.students.push(studentId);
        await group.save();

        res.status(200).json({
            message: 'Студент успешно добавлен в группу',
            group,
        });
    } catch (error) {
        console.error('Ошибка при добавлении студента в группу:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Удаление студента из группы
exports.removeStudentFromGroup = async (req, res) => {
    try {
        const { groupId, studentId } = req.params;

        // Проверка существования группы
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Группа не найдена' });
        }

        // Проверка, если студента нет в группе
        if (!group.students.includes(studentId)) {
            return res
                .status(400)
                .json({ message: 'Студент не найден в группе' });
        }

        // Удаление студента
        group.students = group.students.filter(
            (id) => id.toString() !== studentId
        );
        await group.save();

        res.status(200).json({
            message: 'Студент успешно удален из группы',
            group,
        });
    } catch (error) {
        console.error('Ошибка при удалении студента из группы:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Получение списка групп
exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json({ groups });
    } catch (error) {
        console.error('Ошибка при получении групп:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.getAllGroupPages = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Текущая страница
    const limit = parseInt(req.query.limit) || 8; // Количество записей на странице
    const skip = (page - 1) * limit;

    try {
        const groups = await Group.find().skip(skip).limit(limit);
        const total = await Group.countDocuments();

        res.status(200).json({ groups, total });
    } catch (error) {
        console.error('Ошибка при получении групп:', error);
        res.status(500).json({
            message: 'Ошибка при получении групп',
            error: error.message,
        });
    }
};
