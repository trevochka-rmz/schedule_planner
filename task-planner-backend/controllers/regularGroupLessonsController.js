const RegularGroupLesson = require('../models/RegularGroupLesson');
const GroupLesson = require('../models/GroupLesson');
const Schedule = require('../models/Schedule');

// Получения всех групповых регулярных занятий
exports.getAllRegularGroupLessons = async (req, res) => {
    try {
        const allRegularGroupLessons = await RegularGroupLesson.find();
        if (!allRegularGroupLessons.length) {
            return res
                .status(404)
                .json({ message: 'Регулярные групповые занятия не найдены' });
        }
        res.status(200).json(allRegularGroupLessons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получения группового регулярное занятия по id
exports.getRegularGroupLessonByGroupId = async (req, res) => {
    try {
        const { groupId } = req.params;
        const regularGroupLessons = await RegularGroupLesson.find({
            group: groupId,
        });

        if (!regularGroupLessons.length) {
            return res.status(404).json({
                message: `Регулярные занятия для группы с ID ${groupId} не найдены`,
            });
        }

        res.status(200).json(regularGroupLessons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Добавления групповых регулярных занятий
exports.addRegularGroupLesson = async (req, res) => {
    const {
        teacherId,
        groupId,
        direction,
        startTime,
        duration,
        location,
        dayOfWeek,
        periodStart,
        periodEnd,
    } = req.body;

    try {
        if (new Date(periodEnd) < new Date(periodStart)) {
            return res.status(400).json({
                message: 'Дата окончания не может быть раньше даты начала',
            });
        }

        const regularGroupLesson = new RegularGroupLesson({
            teacher: teacherId,
            group: groupId,
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

                const lesson = new GroupLesson({
                    group: groupId,
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

        const savedLessons = await GroupLesson.insertMany(lessons);
        regularGroupLesson.lessons = savedLessons.map((lesson) => lesson._id);
        await regularGroupLesson.save();

        await Schedule.findOneAndUpdate(
            { teacher: teacherId },
            {
                $push: {
                    lessons: {
                        $each: savedLessons.map((l) => ({
                            lessonId: l._id,
                            lessonType: 'GroupLesson',
                        })),
                    },
                },
            },
            { upsert: true }
        );

        res.status(201).json({
            message: 'Регулярное групповое занятие добавлено',
            regularGroupLesson,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Удаления групповых регулярных занятий
exports.deleteRegularGroupLesson = async (req, res) => {
    const { id } = req.params;

    try {
        const regularGroupLesson = await RegularGroupLesson.findById(
            id
        ).populate('lessons');
        if (!regularGroupLesson) {
            return res
                .status(404)
                .json({ message: 'Регулярное групповое занятие не найдено' });
        }

        const teacherId = regularGroupLesson.teacher;
        const lessonIdsToDelete = regularGroupLesson.lessons.map(
            (lesson) => lesson._id
        );

        await GroupLesson.deleteMany({ _id: { $in: lessonIdsToDelete } });
        await Schedule.updateOne(
            { teacher: teacherId },
            { $pull: { lessons: { lessonId: { $in: lessonIdsToDelete } } } }
        );

        await RegularGroupLesson.findByIdAndDelete(id);
        res.status(200).json({
            message: 'Регулярное групповое занятие удалено',
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
