var config = require('config');
var express = require('express');
var app = module.exports = express();
var logRoutes = require('./routes/logs');

app.get('/logs/:id', logRoutes.byId);

var port = config.get('server.port');
app.listen(port, function() {
  console.log('Server started on port ' + port);
});


