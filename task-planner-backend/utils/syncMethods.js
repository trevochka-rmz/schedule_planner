const User = require('../models/User');
const Lesson = require('../models/Lesson');

const syncLessonStats = async () => {
    try {
        // Синхронизация уроков для всех пользователей
        const users = await User.find({});

        for (const user of users) {
            if (user.role === 'student') {
                const lessonsCompleted = await Lesson.countDocuments({
                    student: user._id,
                    status: 'completed',
                });
                user.studentInfo.lessonsCompleted = lessonsCompleted;
            }

            if (user.role === 'teacher') {
                const lessonsGiven = await Lesson.countDocuments({
                    teacher: user._id,
                    status: 'completed',
                });
                user.teacherInfo.lessonsGiven = lessonsGiven;
            }

            await user.save();
        }

        console.log('Синхронизация статистики завершена');
    } catch (error) {
        console.error('Ошибка синхронизации статистики:', error);
    }
};
module.exports = syncLessonStats;
