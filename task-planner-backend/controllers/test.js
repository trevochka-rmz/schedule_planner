const Lesson = require('../models/Lesson');
const addLesson = async (req, res) => {
    try {
        const {
            data,
            time,
            duration,
            location,
            student,
            direction,
            teacher,
            comment,
        } = req.body;
        const lesson = await Lesson.create({
            data,
            time,
            duration,
            location,
            student,
            direction,
            teacher,
            comment,
        });
        if (lesson) {
            res.status(201).json({ message: 'Запись успешно создана' });
        } else {
            res.status(400).json({
                message: 'Произошла ошибка при записи, попробуйте снова',
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
    }
};
const allLesson = async (req, res) => {
    try {
        const allLessons = await Lesson.find();
        if (!allLessons.length) {
            return res.status(404).json({ message: 'Занятия не найдены' });
        }
        res.status(200).json(allLessons);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
    }
};
const getScheduleByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.body;
        const scheduleTeacher = await Schedule.find({ _id: teacherId });
        if (!scheduleTeacher.length) {
            return res.status(401).json({
                message: 'Нет данных',
            });
        }
        res.status(201).json(scheduleTeacher);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
    }
};
module.exports = { addLesson, allLesson };
