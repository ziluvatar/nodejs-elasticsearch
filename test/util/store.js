var config = require('config');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: config.get('elasticsearch.host'),
  log: config.get('elasticsearch.log')
});

var esIndex = config.get('elasticsearch.index');
var esType = config.get('elasticsearch.type');

var sequence = 0;

module.exports = {
  save: function(items, cb) {
    var operations = [];
    var i;

    for (i = 0; i < items.length; i++) {
      sequence++;
      operations.push({delete: {_index: esIndex, _type: esType, _id: sequence}});
      operations.push({index: {_index: esIndex, _type: esType, _id: sequence}});
      operations.push(items[i]);
    }
    client.bulk({ refresh: true, body: operations }, cb);
  },
  drop: function(cb) {
    var operations = [];
    for (; sequence > 0; sequence--) {
      operations.push({delete: {_index: esIndex, _type: esType, _id: sequence}});
    }
    client.bulk({ refresh: true, body: operations }, cb);
  }
};