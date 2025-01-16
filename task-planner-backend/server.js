require('dotenv').config(); // Подключаем dotenv для работы с .env
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db'); // Подключаем файл для подключения базы данных
const { PORT, CLIENT_URL } = require('./config/keys'); // Импортируем ключи из keys.js
const userRoutes = require('./routes/userRoutes'); // Роуты для пользователей
const scheduleRoutes = require('./routes/scheduleRoutes'); // Роуты для расписания
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const path = require('path');
const syncLessonStats = require('./utils/syncMethods');
const cron = require('node-cron');

const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

// Подключение к базе данных
connectDB();

// Middleware
app.use(cors({ origin: CLIENT_URL })); // Настраиваем CORS для фронтенда
app.use(bodyParser.json()); // Для обработки JSON в запросах
app.use(bodyParser.urlencoded({ extended: true })); // Для обработки данных из форм

// API Роуты
app.use('/api/users', userRoutes); // Маршруты для пользователей
app.use('/api/schedule', scheduleRoutes); // Маршруты для расписания

// Главный маршрут (для проверки сервера)
app.get('/', (req, res) => {
    res.send('Сервер работает! 🚀');
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware для обработки ошибок
app.use(notFound); // Обработка маршрутов, которые не найдены
app.use(errorHandler); // Централизованная обработка ошибок

// Запуск cron-задачи
cron.schedule('0 0 * * *', syncLessonStats);

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
