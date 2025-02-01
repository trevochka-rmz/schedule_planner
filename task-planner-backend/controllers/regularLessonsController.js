const RegularLesson = require('../models/RegularLesson');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const ScheduleStudent = require('../models/ScheduleStudent');
const Lesson = require('../models/Lesson');

exports.getAllRefularLesson = async (req, res) => {
    try {
        const allRegularLessons = await RegularLesson.find();
        if (!allRegularLessons) {
            return res
                .status(404)
                .json({ message: 'Регулярные занятия не найдены' });
        }
        res.status(201).json(allRegularLessons);
    } catch (error) {
        console.error('Ошибка при получения регулярных занятий:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.getRegularLessonByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;

        const regularLessonsById = await RegularLesson.find({
            student: studentId,
        });

        if (!regularLessonsById || regularLessonsById.length === 0) {
            return res.status(404).json({
                message: `Регулярные занятия для студента с ID ${studentId} не найдены`,
            });
        }

        res.status(200).json(regularLessonsById);
    } catch (error) {
        console.error(
            'Ошибка при получении регулярных занятий для студента:',
            error
        );
        res.status(500).json({ error: error.message });
    }
};

exports.addRegularLesson = async (req, res) => {
    const {
        teacherId,
        studentId,
        direction,
        startTime,
        duration,
        location,
        dayOfWeek,
        periodStart,
        periodEnd,
    } = req.body;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Сбрасываем время для сравнения

        if (new Date(periodStart) < today) {
            return res.status(400).json({
                message: 'Дата не может быть раньше сегодняшней',
            });
        }

        if (new Date(periodEnd) < new Date(periodStart)) {
            return res.status(400).json({
                message: 'Дата окончания не может быть раньше даты начала',
            });
        }

        // Создание документа регулярного занятия
        const regularLesson = new RegularLesson({
            teacher: teacherId,
            student: studentId,
            direction,
            startTime,
            duration,
            location,
            dayOfWeek,
            periodStart,
            periodEnd,
        });
        // Генерация дат для занятий
        const start = new Date(periodStart);
        const end = new Date(periodEnd);
        const lessons = [];

        for (
            let date = new Date(start);
            date <= end;
            date.setDate(date.getDate() + 1)
        ) {
            if (date.getDay() === parseInt(dayOfWeek)) {
                const lessonDate = new Date(date);
                const [hour, minute] = startTime.split(':').map(Number);
                lessonDate.setHours(hour, minute, 0, 0);

                const lesson = new Lesson({
                    student: studentId,
                    teacher: teacherId,
                    direction,
                    date: lessonDate,
                    time: startTime,
                    duration,
                    location,
                });

                lessons.push(lesson);
            }
        }

        // Сохранение занятий
        const savedLessons = await Lesson.insertMany(lessons);

        // Связывание занятий с регулярным занятием
        regularLesson.lessons = savedLessons.map((lesson) => lesson._id);
        await regularLesson.save();

        // Обновление расписания преподавателя и студента
        await Schedule.findOneAndUpdate(
            { teacher: teacherId },
            { $push: { lessons: { $each: savedLessons.map((l) => l._id) } } },
            { upsert: true }
        );

        await ScheduleStudent.findOneAndUpdate(
            { student: studentId },
            { $push: { lessons: { $each: savedLessons.map((l) => l._id) } } },
            { upsert: true }
        );

        res.status(201).json({
            message: 'Регулярное занятие было успешно добавлено',
            regularLesson,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRegularLesson = async (req, res) => {
    const { id } = req.params;
    const {
        direction,
        startTime,
        duration,
        location,
        theme,
        dayOfWeek,
        periodStart,
        periodEnd,
    } = req.body;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (new Date(periodStart) < today) {
            return res.status(400).json({
                message: 'The start date cannot be in the past.',
            });
        }

        if (new Date(periodEnd) < new Date(periodStart)) {
            return res.status(400).json({
                message: 'The end date cannot be earlier than the start date.',
            });
        }

        const regularLesson = await RegularLesson.findById(id).populate(
            'lessons'
        );

        if (!regularLesson) {
            return res
                .status(404)
                .json({ message: 'Regular lesson not found' });
        }

        // Удаляем старые занятия из `Lesson`, `Schedule`, и `ScheduleStudent`
        const oldLessons = regularLesson.lessons;
        const teacherId = regularLesson.teacher;
        const studentId = regularLesson.student;

        // Удаляем только занятия со статусом `scheduled`
        await Lesson.deleteMany({
            _id: { $in: oldLessons },
            status: 'scheduled',
        });

        await Schedule.updateOne(
            { teacher: teacherId },
            { $pull: { lessons: { $in: oldLessons } } }
        );

        await ScheduleStudent.updateOne(
            { student: studentId },
            { $pull: { lessons: { $in: oldLessons } } }
        );

        // Обновляем данные регулярного занятия
        regularLesson.direction = direction;
        regularLesson.startTime = startTime;
        regularLesson.duration = duration;
        regularLesson.location = location;
        regularLesson.theme = theme;
        regularLesson.dayOfWeek = dayOfWeek;
        regularLesson.periodStart = periodStart;
        regularLesson.periodEnd = periodEnd;

        // Генерируем новые занятия
        const start = new Date(periodStart);
        const end = new Date(periodEnd);
        const lessons = [];

        for (
            let date = new Date(start);
            date <= end;
            date.setDate(date.getDate() + 1)
        ) {
            if (date.getDay() === dayOfWeek) {
                const lessonDate = new Date(date);
                const [hour, minute] = startTime.split(':').map(Number);
                lessonDate.setHours(hour, minute, 0, 0);

                const lesson = new Lesson({
                    student: studentId,
                    teacher: teacherId,
                    direction,
                    date: lessonDate,
                    time: startTime,
                    duration,
                    location,
                    theme,
                });

                lessons.push(lesson);
            }
        }

        const savedLessons = await Lesson.insertMany(lessons);

        // Добавляем новые занятия в `Schedule` и `ScheduleStudent`
        await Schedule.updateOne(
            { teacher: teacherId },
            { $push: { lessons: { $each: savedLessons.map((l) => l._id) } } },
            { upsert: true }
        );

        await ScheduleStudent.updateOne(
            { student: studentId },
            { $push: { lessons: { $each: savedLessons.map((l) => l._id) } } },
            { upsert: true }
        );

        // Обновляем ссылки на занятия в регулярном занятии
        regularLesson.lessons = savedLessons.map((lesson) => lesson._id);
        await regularLesson.save();

        res.status(200).json({
            message: 'Регулярное занятие успешно обновлено',
            regularLesson,
        });
    } catch (error) {
        console.error('Ошибка при обновлении регулярного занятия:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.deleteRegularLesson = async (req, res) => {
    const { id } = req.params;

    try {
        // Находим регулярное занятие
        const regularLesson = await RegularLesson.findById(id).populate(
            'lessons'
        );

        if (!regularLesson) {
            return res
                .status(404)
                .json({ message: 'Регулярное занятие не найдено' });
        }

        const teacherId = regularLesson.teacher;
        const studentId = regularLesson.student;

        // Отбираем только занятия со статусом `scheduled`
        const scheduledLessons = regularLesson.lessons.filter(
            (lesson) => lesson.status === 'scheduled'
        );

        const lessonIdsToDelete = scheduledLessons.map((lesson) => lesson._id);

        // Удаляем занятия из коллекции `Lesson`
        await Lesson.deleteMany({ _id: { $in: lessonIdsToDelete } });

        // Убираем ссылки на занятия из `Schedule` и `ScheduleStudent`
        await Schedule.updateOne(
            { teacher: teacherId },
            { $pull: { lessons: { $in: lessonIdsToDelete } } }
        );

        await ScheduleStudent.updateOne(
            { student: studentId },
            { $pull: { lessons: { $in: lessonIdsToDelete } } }
        );

        // Удаляем само регулярное занятие
        await RegularLesson.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Регулярные занятия и занятия были успешно удалены',
        });
    } catch (error) {
        console.error('Ошибка при удалении регулярного занятия:', error);
        res.status(500).json({ error: error.message });
    }
};
