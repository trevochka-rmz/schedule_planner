const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // Название группы
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true, // Преподаватель группы
        },
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true, // Список студентов
            },
        ],
        direction: { type: String, required: true }, // Направление обучения
        description: { type: String, default: '' }, // Описание группы
        isActive: { type: Boolean, default: true }, // Активна ли группа
        limit: { type: Number, default: 8 },
        linkToChat: { type: String, required: false }, // Направление обучения
        day: {
            type: String,
            enum: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
            ],
            required: true,
        },
        time: { type: String, required: true },
        location: { type: String, default: 'Онлайн' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
