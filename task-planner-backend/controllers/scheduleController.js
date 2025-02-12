const Schedule = require('../models/Schedule');
const ScheduleStudent = require('../models/ScheduleStudent');

// Получения расписания по id
exports.getScheduleByID = async (req, res) => {
    try {
        const { userID } = req.params;
        const schedule = await Schedule.findOne({ teacher: userID });
        if (!schedule) {
            console.error(
                `Расписание не найдено для преподавателя с ID: ${userID}`
            );
            return res.status(404).json({ message: 'Расписание не найдено' });
        }

        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

// Получения расписения преподавателя
exports.getScheduleByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const schedule = await Schedule.findOne({ teacher: teacherId })
            .populate({
                path: 'lessons.lessonId',
                populate: [
                    {
                        path: 'teacher',
                        select: 'fullname email',
                        options: { lean: true },
                    },
                    {
                        path: 'student',
                        select: 'fullname email',
                        options: { lean: true },
                        strictPopulate: false,
                    },
                    {
                        path: 'group',
                        select: 'name day direction students',
                        options: { lean: true },
                        strictPopulate: false,
                        populate: {
                            path: 'students',
                            select: 'fullname _id',
                            options: { lean: true },
                        },
                    },
                ],
            })
            .lean();

        if (!schedule) {
            console.error(
                `Расписание не найдено для преподавателя с ID: ${teacherId}`
            );
            return res.status(404).json({ message: 'Расписание не найдено' });
        }

        const parseDate = (lesson) => {
            const dateStr =
                typeof lesson.date === 'string'
                    ? lesson.date
                    : lesson.date?.toISOString().split('T')[0];
            const startDate = new Date(`${dateStr}T${lesson.time}`);
            if (isNaN(startDate.getTime()))
                throw new Error(`Некорректная дата: ${dateStr}T${lesson.time}`);
            return {
                start: startDate.toISOString(),
                end: new Date(
                    startDate.getTime() + (lesson.duration || 0) * 60000
                ).toISOString(),
            };
        };

        const formattedLessons = schedule.lessons
            .map(({ lessonId, lessonType }) => {
                try {
                    const { start, end } = parseDate(lessonId);
                    return {
                        id: lessonId._id,
                        title:
                            lessonType === 'Lesson'
                                ? `${lessonId.direction} (${
                                      lessonId.student?.fullname || 'Без имени'
                                  })`
                                : lessonId.group?.name || 'Без имени',
                        start,
                        end,
                        status: lessonId.status,
                        extendedProps: {
                            studentID:
                                lessonType === 'GroupLesson'
                                    ? lessonId.group?.students?.map(
                                          (s) => s._id
                                      ) || []
                                    : [lessonId.student?._id || ''],
                            teacherID:
                                lessonId.teacher?._id ||
                                'Неизвестный ID преподаватель',
                            student:
                                lessonType === 'GroupLesson'
                                    ? lessonId.group?.students?.map(
                                          (s) => s.fullname
                                      ) || []
                                    : [
                                          lessonId.student?.fullname ||
                                              'Неизвестный студент',
                                      ],
                            teacher:
                                lessonId.teacher?.fullname ||
                                'Неизвестный преподаватель',
                            direction:
                                lessonType === 'Lesson'
                                    ? lessonId.direction
                                    : lessonId.group?.direction || 'Не указано',
                            theme: lessonId.theme || '',
                            comment: lessonId.comment || 'Не указано',
                            commentAfter: lessonId.commentAfter || '',
                        },
                    };
                } catch (error) {
                    console.error(
                        `Ошибка форматирования урока с ID: ${lessonId._id}`,
                        error.message
                    );
                    return null;
                }
            })
            .filter(Boolean);

        res.status(200).json({ lessons: formattedLessons });
    } catch (error) {
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

// Получения расписения клиента
exports.getScheduleByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const scheduleStudent = await ScheduleStudent.findOne({
            student: studentId,
        })
            .populate({
                path: 'lessons.lessonId',
                populate: [
                    {
                        path: 'teacher',
                        select: 'fullname email',
                        options: { lean: true },
                    },
                    {
                        path: 'student',
                        select: 'fullname email',
                        options: { lean: true },
                        strictPopulate: false,
                    },
                    {
                        path: 'group',
                        select: 'name day direction students',
                        options: { lean: true },
                        strictPopulate: false,
                        populate: {
                            path: 'students',
                            select: 'fullname _id',
                            options: { lean: true },
                        },
                    },
                ],
            })
            .lean();

        if (!scheduleStudent || !scheduleStudent.lessons.length) {
            return res.status(200).json({ lessons: [] });
        }

        const parseDate = (lesson) => {
            const dateStr =
                typeof lesson.date === 'string'
                    ? lesson.date
                    : lesson.date?.toISOString().split('T')[0];
            const startDate = new Date(`${dateStr}T${lesson.time}`);
            if (isNaN(startDate.getTime()))
                throw new Error(`Некорректная дата: ${dateStr}T${lesson.time}`);
            return {
                start: startDate.toISOString(),
                end: new Date(
                    startDate.getTime() + (lesson.duration || 0) * 60000
                ).toISOString(),
            };
        };

        const formattedLessons = scheduleStudent.lessons
            .map(({ lessonId, lessonType }) => {
                try {
                    const { start, end } = parseDate(lessonId);
                    return {
                        id: lessonId._id,
                        title:
                            lessonType === 'Lesson'
                                ? `${lessonId.direction} (${
                                      lessonId.student?.fullname || 'Без имени'
                                  })`
                                : lessonId.group?.name || 'Без имени',
                        start,
                        end,
                        status: lessonId.status,
                        extendedProps: {
                            studentID:
                                lessonType === 'GroupLesson'
                                    ? lessonId.group?.students?.map(
                                          (s) => s._id
                                      ) || []
                                    : [lessonId.student?._id || ''],
                            teacherID:
                                lessonId.teacher?._id ||
                                'Неизвестный ID преподаватель',
                            student:
                                lessonType === 'GroupLesson'
                                    ? lessonId.group?.students?.map(
                                          (s) => s.fullname
                                      ) || []
                                    : [
                                          lessonId.student?.fullname ||
                                              'Неизвестный студент',
                                      ],
                            teacher:
                                lessonId.teacher?.fullname ||
                                'Неизвестный преподаватель',
                            direction:
                                lessonType === 'Lesson'
                                    ? lessonId.direction
                                    : lessonId.group?.direction || 'Не указано',
                            theme: lessonId.theme || '',
                            comment: lessonId.comment || 'Не указано',
                            commentAfter: lessonId.commentAfter || '',
                        },
                    };
                } catch (error) {
                    return null;
                }
            })
            .filter(Boolean);

        res.status(200).json({ lessons: formattedLessons });
    } catch (error) {
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};
