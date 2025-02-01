const mongoose = require('mongoose');

const groupLessonSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true, // Группа, для которой проводится занятие
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true, // Преподаватель, ведущий занятие
        },
        date: { type: Date, required: true }, // Дата занятия
        time: { type: String, required: true }, // Время (формат: HH:mm)
        duration: { type: Number, default: 60 }, // Длительность занятия
        theme: { type: String, default: '' }, // Тема занятия
        location: { type: String, default: 'Онлайн' }, // Локация
        comment: { type: String, required: false, default: '' },
        commentAfter: { type: String, required: false, default: '' },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'canceled'],
            default: 'scheduled', // Статус занятия
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('GroupLesson', groupLessonSchema);
