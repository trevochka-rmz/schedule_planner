const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }, // Пользователь, создавший задачу
        assignee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }, // Пользователь, которому назначена задача
        title: { type: String, required: true }, // Заголовок задачи
        description: { type: String, default: '' }, // Подробное описание задачи
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed', 'canceled'],
            default: 'pending',
        }, // Статус задачи
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        }, // Приоритет задачи
        deadline: { type: Date }, // Срок выполнения
        completedAt: { type: Date }, // Дата завершения задачи (если выполнена)
        canceledAt: { type: Date }, // Дата отмены задачи (если отменена)
    },
    { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
