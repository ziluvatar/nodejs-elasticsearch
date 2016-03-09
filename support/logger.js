var winston = require('winston');
var config = require('config');

var logger = new winston.Logger({
  level: config.get('server.log'),
  handleExceptions: true,
  humanReadableUnhandledException: true,
  transports: [
    new winston.transports.Console()
  ]
});

module.exports = logger;