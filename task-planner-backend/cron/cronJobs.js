const cron = require('node-cron');
const syncLessonStats = require('../utils/syncMethods');

exports.startCronJobs = () => {
    cron.schedule('0 0 * * *', syncLessonStats);
};
