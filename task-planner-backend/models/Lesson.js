const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        direction: { type: String, required: true },
        date: { type: Date, required: true },
        time: { type: String, required: true },
        duration: { type: Number, default: 60 },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'canceled'],
            default: 'scheduled',
        },
        theme: { type: String, default: '' },
        location: { type: String, default: 'Онлайн' }, // Локация урока
        comment: { type: String, required: false, default: '' },
        commentAfter: { type: String, required: false, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
