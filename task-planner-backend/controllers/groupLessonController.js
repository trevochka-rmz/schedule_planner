const Group = require('../models/Group');
const User = require('../models/User');
const GroupLesson = require('./models/GroupLesson');
const Schedule = require('./models/Schedule');
const ScheduleStudent = require('./models/ScheduleStudent');

exports.createGroupLesson = async (req, res) => {
    const { groupId, date, time, duration, theme, location, comment } =
        groupLessonData;

    try {
        const group = await Group.findById(groupId).populate(
            'teacher students'
        );
        if (!group) {
            throw new Error('Группа не найдена');
        }

        if (!group.isActive) {
            throw new Error('Группа не активна');
        }

        const groupLesson = new GroupLesson({
            group: group._id,
            teacher: group.teacher._id,
            date,
            time,
            duration,
            theme,
            location: location || group.location,
            comment,
        });

        await groupLesson.save();

        const teacherSchedule = await Schedule.findOneAndUpdate(
            { teacher: group.teacher._id },
            { $push: { lessons: groupLesson._id } },
            { new: true, upsert: true }
        );

        for (const student of group.students) {
            await ScheduleStudent.findOneAndUpdate(
                { student: student._id },
                { $push: { lessons: groupLesson._id } },
                { new: true, upsert: true }
            );
        }

        return {
            message: 'Групповое занятие успешно создано',
            groupLesson,
            teacherSchedule,
        };
    } catch (error) {
        console.error(error);
        throw new Error('Ошибка при создании группового занятия');
    }
};

exports.updateGroupLesson = async (req, res) => {
    try {
        const lesson = await GroupLesson.findById(lessonId).populate('group');
        if (!lesson) throw new Error('Занятие не найдено');

        // Проверяем, нужно ли обновить расписания (например, преподавателя, студентов)
        const group = await Group.findById(lesson.group).populate(
            'teacher students'
        );
        if (!group) throw new Error('Группа не найдена');

        // Если обновляется преподаватель или дата/время, обновляем расписание
        if (updateData.teacher || updateData.date || updateData.time) {
            // Удаляем из старого расписания
            await Schedule.findOneAndUpdate(
                { teacher: lesson.teacher },
                { $pull: { lessons: lesson._id } }
            );

            // Добавляем в новое расписание
            if (updateData.teacher) {
                await Schedule.findOneAndUpdate(
                    { teacher: updateData.teacher },
                    { $push: { lessons: lesson._id } },
                    { upsert: true }
                );
            }
        }

        // Если обновляется список студентов, обновляем их расписания
        if (updateData.students) {
            const currentStudents = lesson.group.students;
            const newStudents = updateData.students;

            // Удаляем из расписания старых студентов
            for (const student of currentStudents) {
                if (!newStudents.includes(student.toString())) {
                    await ScheduleStudent.findOneAndUpdate(
                        { student },
                        { $pull: { lessons: lesson._id } }
                    );
                }
            }

            // Добавляем новое занятие в расписание новых студентов
            for (const student of newStudents) {
                if (!currentStudents.includes(student.toString())) {
                    await ScheduleStudent.findOneAndUpdate(
                        { student },
                        { $push: { lessons: lesson._id } },
                        { upsert: true }
                    );
                }
            }
        }

        // Обновляем само занятие
        const updatedLesson = await GroupLesson.findByIdAndUpdate(
            lessonId,
            updateData,
            { new: true }
        );
        return updatedLesson;
    } catch (error) {
        throw new Error(error.message);
    }
};
