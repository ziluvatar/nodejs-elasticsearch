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
  },
  buildEntry: function (ext) {
    var extension = ext || {};
    var entry = {
      tenant: 'test0',
      type: extension.type || 'ss',
      date: extension.date || '2016-01-01T00:00:00.000Z',
      client_id: extension.client_id || config.get('api.security.auth-client-id'),
      client_name: "My application Name",
      ip: extension.ip || "190.254.209.19",
      details: { a: 'detail' },
      description: 'This is a description',
      user_id: extension.user_id || "auth0|56c75c4e42b6359e98374bc2",
      user_name: extension.user_name || "myuser",
      connection: extension.connection || "connection1",
      user_agent: extension.user_agent || "userAgent1",
      impersonator_user_id: 'i1',
      impersonator_user_name: 'im-user1',
      strategy: 'auth0',
      strategy_type: 'database',
      auth0_client: { data: 'client'}
    };
    if (extension.id) {
      entry.id = extension.id;
    }
    return entry;
  }

};