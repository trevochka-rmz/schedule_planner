const mongoose = require('mongoose');

const scheduleStudentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('ScheduleStudent', scheduleStudentSchema);
