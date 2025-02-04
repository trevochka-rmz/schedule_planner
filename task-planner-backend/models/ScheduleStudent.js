const mongoose = require('mongoose');

const scheduleStudentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        lessons: [
            {
                lessonId: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: 'lessons.lessonType',
                },
                lessonType: {
                    type: String,
                    enum: ['Lesson', 'GroupLesson'],
                    required: true,
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('ScheduleStudent', scheduleStudentSchema);
