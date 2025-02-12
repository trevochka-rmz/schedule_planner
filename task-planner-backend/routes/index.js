const express = require('express');

const userRoutes = require('./userRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const regularRoutes = require('./regularRoutes');
const taskRoutes = require('./taskRoutes');
const groupRoutes = require('./groupRoutes');
const scheduleGroupRoutes = require('./scheduleGroupRoutes');

const router = express.Router();

// Подключаем все маршруты
router.use('/users', userRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/regular', regularRoutes);
router.use('/task', taskRoutes);
router.use('/group', groupRoutes);
router.use('/group-lesson', scheduleGroupRoutes);

module.exports = router;
