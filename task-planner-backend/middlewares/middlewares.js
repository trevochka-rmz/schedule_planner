const cors = require('cors');
const bodyParser = require('body-parser');
const { CLIENT_URL } = require('../config/keys');
const { notFound, errorHandler } = require('./errorMiddleware');

exports.setupMiddlewares = (app) => {
    app.use(cors({ origin: CLIENT_URL }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Middleware для обработки ошибок
    app.use(notFound);
    app.use(errorHandler);
};
