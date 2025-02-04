const mongoose = require('mongoose');

const regularGroupLessonSchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },
        direction: { type: String, required: true },
        startTime: { type: String, required: true }, // Формат: HH:mm
        duration: { type: Number, default: 60 },
        location: { type: String, default: 'Онлайн' },
        dayOfWeek: { type: Number, required: true }, // День недели (0 - воскресенье, 6 - суббота)
        periodStart: { type: Date, required: true },
        periodEnd: { type: Date, required: true },
        lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GroupLesson' }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('RegularGroupLesson', regularGroupLessonSchema);
