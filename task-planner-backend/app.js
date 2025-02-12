require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const configureApp = require('./config');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const syncLessonStats = require('./utils/syncMethods');
const cron = require('node-cron');

const app = express();

// Подключение к базе данных
connectDB();

// Настройка middleware
configureApp(app);

// Создание папки uploads, если ее нет
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Подключение маршрутов
app.use('/api', routes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Главный маршрут (проверка работы сервера)
app.get('/', (req, res) => {
    res.send('Сервер работает! 🚀');
});

// Middleware для обработки ошибок
app.use(notFound);
app.use(errorHandler);

// Запуск cron-задачи
cron.schedule('0 0 * * *', syncLessonStats);

module.exports = app;
