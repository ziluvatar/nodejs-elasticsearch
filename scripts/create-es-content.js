var esClient = require('../support/es-client');
var config = require('config');
var esIndex = config.get('elasticsearch.index');
var esType = config.get('elasticsearch.type');

var logs = require('./es-logs.json');
var operations = [];
var i;

for (i = 0; i < logs.length; i++) {
  operations.push({delete: {_index: esIndex, _type: esType, _id: i + 1}});
  operations.push({index: {_index: esIndex, _type: esType, _id: i + 1}});

  if (logs[i].client_id === "ok") {
    logs[i].client_id = config.get('api.security.auth-client-id');
  }
  operations.push(logs[i]);
}

esClient.bulk({ refresh: true, body: operations }, function(err){
  if (err) return console.error(err);
  console.log('Data loaded!')
});