const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/keys');

// Middleware для проверки авторизации (JWT токен)
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Извлечение токена
            token = req.headers.authorization.split(' ')[1];

            // Расшифровка токена
            const decoded = jwt.verify(token, JWT_SECRET);

            // Поиск пользователя по ID из токена
            req.user = await User.findById(decoded.id).select('-password'); // Убираем пароль из запроса

            next(); // Передаём управление следующему middleware/контроллеру
        } catch (error) {
            console.error(error);
            res.status(401).json({
                message: 'Неавторизован, некорректный токен',
            });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Неавторизован, токен отсутствует' });
    }
};
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res
            .status(403)
            .json({ message: 'Доступ запрещен: отсутствует токен' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Расшифровка токена
        req.user = decoded; // Привязываем данные пользователя к запросу
        next();
    } catch (error) {
        res.status(403).json({
            message: 'Доступ запрещен: недействительный токен',
        });
    }
};

// Middleware для проверки роли пользователя
const roleCheck = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res
                .status(403)
                .json({ message: 'Недостаточно прав для доступа' });
        }
        next(); // Если роль подходит, передаём управление
    };
};

module.exports = {
    protect,
    verifyToken,
    roleCheck,
};
