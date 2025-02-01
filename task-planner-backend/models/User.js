const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true },
        email: { type: String, sparse: true, default: '', unique: true },
        login: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        urlPhoto: { type: String, default: '' },
        role: {
            type: String,
            enum: ['student', 'teacher', 'manager', 'admin'],
            required: true,
        },
        phone: { type: String, sparse: true, default: '', unique: true },
        contacts: [
            {
                // Список контактов (телефон, email и т.д.)
                type: {
                    type: String,
                    enum: ['phone', 'email', 'telegram', 'other'],
                },
                value: { type: String, required: true },
            },
        ],
        studentInfo: {
            birthDate: { type: Date },
            gender: { type: String, enum: ['male', 'female'] },
            direction: { type: String }, // Направление обучения (например, JavaScript, Python)
            lessonPrice: { type: Number, required: false },
            lessonsCompleted: { type: Number, default: 0 },
            lessonsRemaining: { type: Number, default: 0 },
            isActive: { type: Boolean, default: true },
            description: { type: String }, // Дополнительное описание ученика
            groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
        },
        teacherInfo: {
            birthDate: { type: Date },
            gender: { type: String, enum: ['male', 'female'] },
            salary: { type: Number, default: 0 },
            lessonsGiven: { type: Number, default: 0 },
        },
        managerInfo: {
            department: { type: String },
            birthDate: { type: Date },
            gender: { type: String, enum: ['male', 'female'] },
            studentsAssigned: [
                { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            ],
        },
    },
    { timestamps: true }
);

// Пользовательская валидация
userSchema.pre('validate', function (next) {
    if (!this.email && !this.phone) {
        return next(
            new Error('Необходимо указать либо email, либо номер телефона.')
        );
    }
    next();
});

// Хэширование пароля перед сохранением
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Метод для проверки пароля
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
