const RegularLesson = require('../models/RegularLesson');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const ScheduleStudent = require('../models/ScheduleStudent');
const Lesson = require('../models/Lesson');

// Получения всех регулярных занятий
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
        res.status(500).json({ error: error.message });
    }
};

// Получения регулярных занятий студента по Id
exports.getRegularLessonByStudentId = async (req, res) => {
    try {
        const { id } = req.params;

        const regularLessonsById = await RegularLesson.find({ student: id });

        // Возвращаем пустой массив вместо 404
        res.status(200).json(
            regularLessonsById.length > 0 ? regularLessonsById : []
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Добавления регулярного занятия
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
        today.setHours(0, 0, 0, 0);
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

        const savedLessons = await Lesson.insertMany(lessons);
        regularLesson.lessons = savedLessons.map((lesson) => lesson._id);
        await regularLesson.save();
        await Schedule.findOneAndUpdate(
            { teacher: teacherId },
            {
                $push: {
                    lessons: {
                        $each: savedLessons.map((l) => ({
                            lessonId: l._id,
                            lessonType: 'Lesson',
                        })),
                    },
                },
            },
            { upsert: true }
        );
        await ScheduleStudent.findOneAndUpdate(
            { student: studentId },
            {
                $push: {
                    lessons: {
                        $each: savedLessons.map((l) => ({
                            lessonId: l._id,
                            lessonType: 'Lesson',
                        })),
                    },
                },
            },
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

// Обновления регулярного занятия
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
                message: 'Дата начала периода не может быть в прошлом.',
            });
        }

        if (new Date(periodEnd) < new Date(periodStart)) {
            return res.status(400).json({
                message:
                    'Дата окончания периода не может быть раньше даты начала.',
            });
        }

        const regularLesson = await RegularLesson.findById(id).populate(
            'lessons'
        );

        if (!regularLesson) {
            return res
                .status(404)
                .json({ message: 'Регулярное занятие не найдено' });
        }

        const oldLessons = regularLesson.lessons;
        const teacherId = regularLesson.teacher;
        const studentId = regularLesson.student;

        // ... (удаление старых занятий)

        regularLesson.direction = direction;
        regularLesson.startTime = startTime;
        regularLesson.duration = duration;
        regularLesson.location = location;
        regularLesson.theme = theme;
        regularLesson.dayOfWeek = dayOfWeek;
        regularLesson.periodStart = periodStart;
        regularLesson.periodEnd = periodEnd;

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

        // ... (создание новых занятий и обновление расписаний)

        regularLesson.lessons = savedLessons.map((lesson) => lesson._id);
        await regularLesson.save();

        res.status(200).json({
            message: 'Регулярное занятие успешно обновлено',
            regularLesson,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Удаления регулярного занятия
exports.deleteRegularLesson = async (req, res) => {
    const { id } = req.params;

    try {
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
        const scheduledLessons = regularLesson.lessons.filter(
            (lesson) => lesson.status === 'scheduled'
        );

        const lessonIdsToDelete = scheduledLessons.map((lesson) => lesson._id);

        await Lesson.deleteMany({ _id: { $in: lessonIdsToDelete } });

        await Schedule.updateOne(
            { teacher: teacherId },
            { $pull: { lessons: { lessonId: { $in: lessonIdsToDelete } } } }
        );

        await ScheduleStudent.updateOne(
            { student: studentId },
            { $pull: { lessons: { lessonId: { $in: lessonIdsToDelete } } } }
        );

        await RegularLesson.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Регулярные занятия и занятия были успешно удалены',
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
