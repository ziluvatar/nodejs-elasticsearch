var config = require('config');
var express = require('express');
var app = module.exports = express();
var logRoutes = require('./routes/logs');
var security = require('./middleware/security');

app.use('/logs', security.verify);

app.get('/logs/:id', logRoutes.byId);

app.use(security.errorHandler);

var port = config.get('server.port');
app.listen(port, function() {
  console.log('Server started on port ' + port);
});


