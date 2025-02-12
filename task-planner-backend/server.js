const app = require('./app');
const { PORT } = require('./config/keys');

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
