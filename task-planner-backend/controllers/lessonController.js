const Lesson = require('../models/Lesson');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const ScheduleStudent = require('../models/ScheduleStudent');

// Получения занятия по ID
exports.getLessonById = async (req, res) => {
    try {
        const { lessonId } = req.params;

        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            console.error(`Занятие не найдено с ID: ${lessonId}`);
            return res.status(404).json({ message: 'Занятие не найдено' });
        }

        res.status(200).json(lesson);
    } catch (error) {
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

exports.updateLessonStatus = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { status } = req.body;

        const lesson = await Lesson.findById(lessonId).populate(
            'student teacher'
        );
        if (!lesson) {
            return res.status(404).json({ message: 'Урок не найден' });
        }

        if (!['scheduled', 'completed', 'canceled'].includes(status)) {
            return res.status(400).json({ message: 'Неправильный статус' });
        }

        const student = await User.findById(lesson.student._id);
        const teacher = await User.findById(lesson.teacher._id);

        if (!student || !teacher) {
            return res
                .status(404)
                .json({ message: 'Преподаватель или студент не найден' });
        }

        // Обновление данных в зависимости от нового и старого статуса
        if (lesson.status === 'scheduled' && status === 'completed') {
            student.studentInfo.lessonsCompleted += 1;
            student.studentInfo.lessonsRemaining = Math.max(
                0,
                student.studentInfo.lessonsRemaining - 1
            );
            teacher.teacherInfo.lessonsGiven += 1;
        } else if (lesson.status === 'completed' && status === 'scheduled') {
            student.studentInfo.lessonsCompleted = Math.max(
                0,
                student.studentInfo.lessonsCompleted - 1
            );
            student.studentInfo.lessonsRemaining += 1;
            teacher.teacherInfo.lessonsGiven = Math.max(
                0,
                teacher.teacherInfo.lessonsGiven - 1
            );
        } else if (lesson.status === 'scheduled' && status === 'canceled') {
            student.studentInfo.lessonsRemaining = Math.max(
                0,
                student.studentInfo.lessonsRemaining - 1
            );
        } else if (lesson.status === 'canceled' && status === 'scheduled') {
            student.studentInfo.lessonsRemaining += 1;
        }

        lesson.status = status;
        await lesson.save();
        await student.save();
        await teacher.save();

        res.json({ message: 'Статус урок успешно обновлен', lesson });
    } catch (error) {
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};
exports.deleteLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const lesson = await Lesson.findById(lessonId).populate(
            'student teacher'
        );
        if (!lesson) {
            return res.status(404).json({ message: 'Занятие не найдено' });
        }

        const student = await User.findById(lesson.student._id);
        const teacher = await User.findById(lesson.teacher._id);

        if (!student || !teacher) {
            return res
                .status(404)
                .json({ message: 'Преподаватель или студент не найден' });
        }

        // Обновление данных в зависимости от статуса урока
        if (lesson.status === 'scheduled') {
            student.studentInfo.lessonsRemaining = Math.max(
                0,
                student.studentInfo.lessonsRemaining - 1
            );
        } else if (lesson.status === 'completed') {
            student.studentInfo.lessonsCompleted = Math.max(
                0,
                student.studentInfo.lessonsCompleted - 1
            );
            teacher.teacherInfo.lessonsGiven = Math.max(
                0,
                teacher.teacherInfo.lessonsGiven - 1
            );
        }

        await student.save();
        await teacher.save();

        // Удаление урока из расписания учителя и студента
        await Schedule.updateOne(
            { teacher: teacher._id },
            { $pull: { lessons: { lessonId } } }
        );
        await ScheduleStudent.updateOne(
            { student: student._id },
            { $pull: { lessons: { lessonId } } }
        );

        await Lesson.findByIdAndDelete(lessonId);
        res.json({ message: 'Занятие успешно удалено' });
    } catch (error) {
        res.status(500).json({
            message: 'Ошибка сервера',
            error: error.message,
        });
    }
};

// Создание занятия
exports.addLessonToSchedule = async (req, res) => {
    try {
        const { lessonData } = req.body;
        const newLesson = await Lesson.create(lessonData);

        let schedule = await Schedule.findOne({ teacher: lessonData.teacher });
        if (schedule) {
            schedule.lessons.push({
                lessonId: newLesson._id,
                lessonType: lessonData.lessonType,
            });
            await schedule.save();
        } else {
            schedule = await Schedule.create({
                teacher: lessonData.teacher,
                lessons: [
                    {
                        lessonId: newLesson._id,
                        lessonType: lessonData.lessonType,
                    },
                ],
            });
        }

        let scheduleStudent = await ScheduleStudent.findOne({
            student: lessonData.student,
        });
        if (scheduleStudent) {
            scheduleStudent.lessons.push({
                lessonId: newLesson._id,
                lessonType: lessonData.lessonType,
            });
            await scheduleStudent.save();
        } else {
            scheduleStudent = await ScheduleStudent.create({
                student: lessonData.student,
                lessons: [
                    {
                        lessonId: newLesson._id,
                        lessonType: lessonData.lessonType,
                    },
                ],
            });
        }

        res.status(201).json({
            message: 'Урок добавлен',
            lesson: newLesson,
            schedule,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Ошибка добавления урока',
            error: error.message || error,
        });
    }
};

// Просмотр всех занятий
exports.allLesson = async (req, res) => {
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

// Изменения в занятии
exports.updateLesson = async (req, res) => {
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
        res.status(500).json({
            message: 'Ошибка обновления урока',
            error: error.message || error,
        });
    }
};
