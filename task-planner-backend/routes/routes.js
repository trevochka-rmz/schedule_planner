const express = require('express');
const userRoutes = require('./userRoutes');
const regularRoutes = require('./regularRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const taskRoutes = require('./taskRoutes');
const groupRoutes = require('./groupRoutes');
const scheduleGroupRoutes = require('./scheduleGroupRoutes');

console.log('hjf,jnf');
exports.setupRoutes = (app) => {
    app.use('/api/users', userRoutes);
    app.use('/api/schedule', scheduleRoutes);
    app.use('/api/regular', regularRoutes);
    app.use('/api/task', taskRoutes);
    app.use('/api/group', groupRoutes);
    app.use('/api/group-lesson', scheduleGroupRoutes);

    app.get('/', (req, res) => res.send('Сервер работает! 🚀'));
};
