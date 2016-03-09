var config = require('config');
var express = require('express');
var app = module.exports = express();
var logsById = require('./routes/logs-by-id').byId;
var logsByFields = require('./routes/logs-by-field').byFields;
var security = require('./middleware/security');
var validator = require('./support/validator');
var cors = require('cors');
var logger = require('./support/logger');
var morgan = require('morgan');

app.use(morgan('dev'));
app.use(cors());
app.use(validator.middleware);
app.use('/logs', security.verify);

app.get('/logs/:id', logsById);
app.get('/logs', logsByFields);

app.use(security.errorHandler);
app.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  logger.error(err);
  res.sendStatus(500);
});

var port = config.get('server.port');
app.listen(port, function() {
  logger.info(`Server started on port ${port}`);
});


