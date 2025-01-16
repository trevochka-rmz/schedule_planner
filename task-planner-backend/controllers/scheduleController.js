const Lesson = require('../models/Lesson');
const Schedule = require('../models/Schedule');
const User = require('../models/User');

const getScheduleByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Проверяем, существует ли расписание
        const schedule = await Schedule.findOne({
            teacher: teacherId,
        }).populate({
            path: 'lessons',
            populate: {
                path: 'student teacher',
                select: 'fullname email',
            },
        });
        if (!schedule) {
            console.error(
                `Расписание не найдено для преподавателя с ID: ${teacherId}`
            );
            return res.status(404).json({ message: 'Расписание не найдено' });
        }

        // Форматируем данные
        const formattedLessons = schedule.lessons
            .map((lesson) => {
                try {
                    let startDate;

                    // Определяем тип `lesson.date`
                    if (typeof lesson.date === 'string') {
                        // Если `lesson.date` — это строка
                        if (lesson.date.includes('T')) {
                            startDate = new Date(lesson.date); // ISO-формат
                        } else {
                            // Если `lesson.date` — это дата без времени
                            startDate = new Date(
                                `${lesson.date}T${lesson.time}`
                            );
                        }
                    } else if (lesson.date instanceof Date) {
                        // Если `lesson.date` — это объект Date
                        startDate = new Date(
                            `${lesson.date.toISOString().split('T')[0]}T${
                                lesson.time
                            }`
                        );
                    } else {
                        throw new Error(
                            `Некорректный формат даты: ${lesson.date}`
                        );
                    }

                    // Проверяем корректность времени
                    if (isNaN(startDate.getTime())) {
                        throw new Error(
                            `Некорректное время: ${lesson.date}T${lesson.time}`
                        );
                    }
                    // Рассчитываем endDate
                    const endDate = new Date(
                        startDate.getTime() + (lesson.duration || 0) * 60000
                    );
                    return {
                        id: lesson._id,
                        title: `${lesson.direction} (${
                            lesson.student?.fullname || 'Без имени'
                        })`,
                        start: startDate.toISOString(),
                        end: endDate.toISOString(),
                        status: lesson.status,
                        extendedProps: {
                            studentID:
                                lesson.student?._id || 'Неизвестный ID студент',
                            teacherID:
                                lesson.teacher?._id ||
                                'Неизвестный ID преподаватель',
                            student:
                                lesson.student?.fullname ||
                                'Неизвестный студент',
                            teacher:
                                lesson.teacher?.fullname ||
                                'Неизвестный преподаватель',
                            direction: lesson.direction || 'Не указано',
                            theme: lesson.theme || 'Не указано',
                            comment: lesson.comment || 'Не указано',
                            commentAfter: lesson.commentAfter || 'Не указано',
                        },
                    };
                } catch (error) {
                    console.error(
                        `Ошибка форматирования урока с ID: ${lesson._id}`,
                        error.message
                    );
                    return null; // Пропускаем ошибочные уроки
                }
            })
            .filter(Boolean); // Убираем null-значения

        res.status(200).json({ lessons: formattedLessons });
    } catch (error) {
        console.error('Ошибка сервера при получении расписания:', error);
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

// Получения занятия по ID
const getLessonById = async (req, res) => {
    try {
        const { lessonId } = req.params;

        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            console.error(`Занятие не найдено с ID: ${lessonId}`);
            return res.status(404).json({ message: 'Занятие не найдено' });
        }

        res.status(200).json(lesson);
    } catch (error) {
        console.error('Ошибка сервера при получении занятия:', error);
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

// Изменения в занятии
const updateLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const updateData = req.body;

        // Обновляем данные урока
        const updatedLesson = await Lesson.findByIdAndUpdate(
            lessonId,
            updateData,
            { new: true } // Возвращаем обновленный документ
        );

        if (!updatedLesson) {
            return res.status(404).json({ message: 'Урок не найден' });
        }

        res.status(200).json({
            message: 'Урок обновлён',
            lesson: updatedLesson,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Ошибка обновления урока',
            error: error.message || error,
        });
    }
};

// Добавление занятия
const addLessonToSchedule = async (req, res) => {
    try {
        const { lessonData } = req.body;
        // Создаём урок
        const newLesson = await Lesson.create(lessonData);

        // Получаем расписание преподавателя
        let schedule = await Schedule.findOne({ teacher: lessonData.teacher });
        // Если расписание существует — обновляем startDate и endDate
        if (schedule) {
            schedule.lessons.push(newLesson._id);
            await schedule.save();
        } else {
            // Если расписания нет, создаём новое
            schedule = await Schedule.create({
                teacher: lessonData.teacher,
                lessons: [newLesson._id],
            });
        }

        res.status(201).json({
            message: 'Урок добавлен',
            lesson: newLesson,
            schedule,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Ошибка добавления урока',
            error: error.message || error,
        });
    }
};

// Просмотр всех занятий
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

// Обновление статуса занятия
const updateLessonStatus = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { status } = req.body;

        // Проверяем, допустим ли новый статус
        if (!['scheduled', 'completed', 'canceled'].includes(status)) {
            return res.status(400).json({ message: 'Некорректный статус' });
        }

        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({ message: 'Урок не найден' });
        }

        // Сохраняем предыдущий статус для анализа
        const previousStatus = lesson.status;

        lesson.status = status;
        await lesson.save();

        // Обновляем статистику, если статус изменился
        if (previousStatus !== status) {
            if (previousStatus === 'completed' && status !== 'completed') {
                // Урок был завершен, но теперь отменен или перенесен
                await User.findByIdAndUpdate(lesson.student, {
                    $inc: { 'studentInfo.lessonsCompleted': -1 },
                    $inc: { 'studentInfo.lessonsRemaining': 1 },
                });
                await User.findByIdAndUpdate(lesson.teacher, {
                    $inc: { 'teacherInfo.lessonsGiven': -1 },
                });
            } else if (
                previousStatus !== 'completed' &&
                status === 'completed'
            ) {
                // Урок завершен
                await User.findByIdAndUpdate(lesson.student, {
                    $inc: { 'studentInfo.lessonsCompleted': 1 },
                    $inc: { 'studentInfo.lessonsRemaining': -1 },
                });
                await User.findByIdAndUpdate(lesson.teacher, {
                    $inc: { 'teacherInfo.lessonsGiven': 1 },
                });
            }
        }

        res.status(200).json({ message: 'Статус урока обновлен', lesson });
    } catch (error) {
        console.error('Ошибка обновления статуса урока:', error);
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

// Удаление урока
const deleteLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;

        // Найти урок
        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({ message: 'Урок не найден' });
        }

        // Если урок завершен, скорректировать статистику
        if (lesson.status === 'completed') {
            await User.findByIdAndUpdate(lesson.student, {
                $inc: {
                    'studentInfo.lessonsCompleted': -1,
                    'studentInfo.lessonsRemaining': 1,
                },
            });
            await User.findByIdAndUpdate(lesson.teacher, {
                $inc: { 'teacherInfo.lessonsGiven': -1 },
            });
        }

        // Удалить урок из расписания
        await Schedule.updateOne(
            { lessons: lessonId },
            { $pull: { lessons: lessonId } }
        );

        // Удалить сам урок
        await Lesson.findByIdAndDelete(lessonId);

        res.status(200).json({ message: 'Урок удален' });
    } catch (error) {
        console.error('Ошибка удаления урока:', error);
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

const clearSchedule = async (req, res) => {
    try {
        const { teacherId } = req.params;

        const schedule = await Schedule.findOneAndUpdate(
            { teacher: teacherId },
            { lessons: [] },
            { new: true }
        );

        res.status(200).json({ message: 'Расписание очищено', schedule });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка очистки расписания', error });
    }
};

module.exports = {
    addLessonToSchedule,
    allLesson,
    getScheduleByTeacher,
    updateLessonStatus,
    deleteLesson,
    updateLesson,
    getLessonById,
};
