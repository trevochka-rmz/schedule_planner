// const connectDB = require('./config/db');
// const User = require('./models/User');

// connectDB();
// async function registerOne() {
//     try {
//         const user = await User.create({
//             firstName: 'Вова',
//             lastName: 'Тонкий',
//             email: 'alximus@gmail.com',
//             password: 'global123',
//             role: 'teacher',
//         });
//         console.log('User registered:', user);
//     } catch (error) {
//         console.error('Error registering user:', error);
//     }
// }
// async function writeAll() {
//     try {
//         const users = await User.find();
//         console.log(users);
//     } catch (error) {
//         console.error('Error', error);
//     }
// }
// writeAll();

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/keys');
const User = require('./models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};
const register = async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;
    try {
        const userExist = User.findOne({ email });
        if (userExist) {
            res.status(400).json({ message: 'user with email have' });
        }
        const user = User.create({
            firstName,
            lastName,
            email,
            password,
            role,
        });
        if (user) {
            res.status(201).json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id), // Возвращаем JWT токен
            });
        } else {
            res.status(400).json({
                message: 'Ошибка при создании пользователя',
            });
        }
    } catch (e) {
        console.error('error', error);
    }
};
