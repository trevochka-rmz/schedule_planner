const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
