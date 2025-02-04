const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');

// Генерация логина
exports.generateUniqueLogin = async (fullname) => {
    const usernameBase = fullname.split(' ')[0].toLowerCase();
    let uniqueLogin;
    let isUnique = false;

    while (!isUnique) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        uniqueLogin = `${usernameBase}${randomSuffix}`;
        const existingUser = await User.findOne({ login: uniqueLogin });
        if (!existingUser) {
            isUnique = true;
        }
    }
    return uniqueLogin;
};

// Генерация токена
exports.generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d',
    });
};
