const cors = require('cors');
const bodyParser = require('body-parser');
const { CLIENT_URL } = require('./keys');

const configureApp = (app) => {
    app.use(cors({ origin: CLIENT_URL }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
};

module.exports = configureApp;
