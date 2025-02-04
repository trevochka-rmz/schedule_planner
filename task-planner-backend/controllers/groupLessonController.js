const Group = require('../models/Group');
const User = require('../models/User');
const GroupLesson = require('../models/GroupLesson');
const Schedule = require('../models/Schedule');
const ScheduleStudent = require('../models/ScheduleStudent');

// Создания группового занития
exports.createGroupLesson = async (req, res) => {
    try {
        const {
            groupId,
            date,
            time,
            duration,
            theme,
            location,
            comment,
            commentAfter,
        } = req.body;

        const group = await Group.findById(groupId).populate(
            'teacher students'
        );
        if (!group) return res.status(404).json({ error: 'Группа не найдена' });

        const lesson = new GroupLesson({
            group: groupId,
            teacher: group.teacher,
            date,
            time,
            duration: duration || 60,
            theme: theme || '',
            location: location || 'Онлайн',
            comment: comment || '',
            commentAfter: commentAfter || '',
        });

        await lesson.save();

        await Schedule.findOneAndUpdate(
            { teacher: group.teacher._id },
            {
                $push: {
                    lessons: {
                        lessonId: lesson._id,
                        lessonType: 'GroupLesson',
                    },
                },
            },
            { upsert: true }
        );

        for (const student of group.students) {
            await ScheduleStudent.findOneAndUpdate(
                { student: student._id },
                {
                    $push: {
                        lessons: {
                            lessonId: lesson._id,
                            lessonType: 'GroupLesson',
                        },
                    },
                },
                { upsert: true }
            );
        }

        res.status(201).json({
            message: 'Групповое занятие успешно создано',
            lesson,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Обновления группового занятия
exports.updateGroupLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const lesson = await GroupLesson.findById(id).populate('group');
        if (!lesson)
            return res.status(404).json({ error: 'Занятие не найдено' });

        const group = await Group.findById(lesson.group).populate(
            'teacher students'
        );
        if (!group) return res.status(404).json({ error: 'Группа не найдена' });

        if (updateData.teacher || updateData.date || updateData.time) {
            await Schedule.findOneAndUpdate(
                { teacher: lesson.teacher },
                { $pull: { lessons: { lessonId: lesson._id } } }
            );

            if (updateData.teacher) {
                await Schedule.findOneAndUpdate(
                    { teacher: updateData.teacher },
                    {
                        $push: {
                            lessons: {
                                lessonId: lesson._id,
                                lessonType: 'GroupLesson',
                            },
                        },
                    },
                    { upsert: true }
                );
            }
        }

        if (updateData.students) {
            const currentStudents = group.students.map((student) =>
                student._id.toString()
            );
            const newStudents = updateData.students;

            for (const student of currentStudents) {
                if (!newStudents.includes(student)) {
                    await ScheduleStudent.findOneAndUpdate(
                        { student },
                        { $pull: { lessons: { lessonId: lesson._id } } }
                    );
                }
            }

            for (const student of newStudents) {
                if (!currentStudents.includes(student)) {
                    await ScheduleStudent.findOneAndUpdate(
                        { student },
                        {
                            $push: {
                                lessons: {
                                    lessonId: lesson._id,
                                    lessonType: 'GroupLesson',
                                },
                            },
                        },
                        { upsert: true }
                    );
                }
            }
        }
        const updatedLesson = await GroupLesson.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        res.status(200).json(updatedLesson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Удаления группового занятия
exports.deleteGroupLesson = async (req, res) => {
    try {
        const { id } = req.params;

        const lesson = await GroupLesson.findById(id);
        if (!lesson)
            return res.status(404).json({ error: 'Занятие не найдено' });

        await Schedule.findOneAndUpdate(
            { teacher: lesson.teacher },
            { $pull: { lessons: { lessonId: lesson._id } } }
        );

        const group = await Group.findById(lesson.group).populate('students');
        if (group) {
            for (const student of group.students) {
                await ScheduleStudent.findOneAndUpdate(
                    { student: student._id },
                    { $pull: { lessons: { lessonId: lesson._id } } }
                );
            }
        }

        await GroupLesson.findByIdAndDelete(id);
        res.status(200).json({ message: 'Занятие успешно удалено' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Изменить статус занятия
exports.updateLessonStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const lesson = await GroupLesson.findById(id).populate('group');
        if (!lesson)
            return res.status(404).json({ error: 'Занятие не найдено' });

        const group = await Group.findById(lesson.group).populate(
            'teacher students'
        );
        if (!group) return res.status(404).json({ error: 'Группа не найдена' });

        const { teacher, students } = group;
        if (lesson.status !== status) {
            if (status === 'completed') {
                await User.findByIdAndUpdate(teacher._id, {
                    $inc: { 'teacherInfo.lessonsGiven': 1 },
                });

                for (const student of students) {
                    await User.findByIdAndUpdate(student._id, {
                        $inc: {
                            'studentInfo.lessonsCompleted': 1,
                            'studentInfo.lessonsRemaining': -1,
                        },
                    });
                }
            } else if (status === 'canceled') {
                for (const student of students) {
                    await User.findByIdAndUpdate(student._id, {
                        $inc: { 'studentInfo.lessonsRemaining': 1 },
                    });
                }
            }
        }

        lesson.status = status;
        await lesson.save();

        res.status(200).json(lesson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получить все занятия
exports.getAllLessons = async (req, res) => {
    try {
        const lessons = await GroupLesson.find()
            .populate('group teacher')
            .sort({ date: 1 });
        res.status(200).json(lessons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Получения групповых занятий
exports.getGroupLessons = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ message: 'Группа не найдена' });
        }
        const lessons = await GroupLesson.find({ group: id })
            .populate({
                path: 'group',
                select: 'day direction',
            })
            .populate('teacher', 'fullname email')
            .sort({ date: 1, time: 1 })
            .lean();
        const formattedLessons = lessons.map((lesson) => {
            try {
                let startDate;

                if (typeof lesson.date === 'string') {
                    if (lesson.date.includes('T')) {
                        startDate = new Date(lesson.date);
                    } else {
                        startDate = new Date(`${lesson.date}T${lesson.time}`);
                    }
                } else if (lesson.date instanceof Date) {
                    startDate = new Date(
                        `${lesson.date.toISOString().split('T')[0]}T${
                            lesson.time
                        }`
                    );
                } else {
                    throw new Error(`Некорректный формат даты: ${lesson.date}`);
                }
                if (isNaN(startDate.getTime())) {
                    throw new Error(
                        `Некорректное время: ${lesson.date}T${lesson.time}`
                    );
                }
                const endDate = new Date(
                    startDate.getTime() + (lesson.duration || 0) * 60000
                );
                return {
                    ...lesson,
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                };
            } catch (error) {
                return null;
            }
        });

        res.status(200).json({ lessons: formattedLessons });
    } catch (error) {
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

// Получить занятие по id
exports.getLessonById = async (req, res) => {
    try {
        const { id } = req.params;

        const lesson = await GroupLesson.findById(id)
            .populate('group teacher')
            .populate({ path: 'group', populate: { path: 'students' } });

        if (!lesson)
            return res.status(404).json({ error: 'Занятие не найдено' });

        res.status(200).json(lesson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
