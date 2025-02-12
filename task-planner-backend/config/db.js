const mongoose = require('mongoose');
const { MONGO_URL } = require('./keys.js');

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Подключение к MongoDB успешно!');
    } catch (error) {
        console.error('Ошибка подключения к MongoDB', error.message);
        process.exit(1);
    }
};
module.exports = connectDB;
