const mongoose = require('mongoose');
const express  = require('express');
const logger   = require('./util/logger');
const router   = require('./routers/box');

const app = express();

app.use(require('express-winston').logger({
    winstonInstance: logger,
}));

app.use(express.json());
app.use(router);

mongoose.connect('mongodb://mongo:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err) => {
    if (err) {
        logger.error(`unable to connect to mongo database: ${err}`);
        process.exit(1);
    }
});

app.listen(8080, '0.0.0.0');
