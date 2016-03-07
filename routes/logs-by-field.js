var config = require('config');
var esClient = require('../support/es-client');
var esIndex = config.get('elasticsearch.index');
var esType = config.get('elasticsearch.type');
var pageSize = config.get('api.pageSize');
var BodyBuilder = require('bodybuilder');

const fieldsMapping = {
  user_name: 'user_name',
  connection: 'connection',
  user_id: 'user_id',
  ip: 'ip'
};

function sanitizeOptions(req) {
  return {
    pagination: {
      start: parseInt(req.query.start || 0),
      pageSize: parseInt(req.query.limit || pageSize)
    },
    security: {
      client_id: req.user.aud
    },
    user_name: req.query.user_name,
    connection: req.query.connection,
    user_id: req.query.user_id,
    ip: req.query.ip
  }
}

function getEntriesByField(req, res) {
  var options = sanitizeOptions(req);

  function searchResolve(data) {
    res.json({
      start: options.pagination.start,
      total: data.hits.total,
      length: data.hits.hits.length,
      limit: options.pagination.pageSize,
      logs: data.hits.hits.map(h => h._source)
    });
  }

  function searchReject(err) {
    res.sendStatus(500);
    console.error(err);
  }

  esClient
    .search({
      index: esIndex,
      type: esType,
      body: buildESQuery(options)
    })
    .then(searchResolve)
    .catch(searchReject);
}

function buildESQuery(options) {
  var bodyBuilder = new BodyBuilder()
    .filter('term','client_id',options.security.client_id)
    .size(options.pagination.pageSize)
    .from(options.pagination.start)
    .sort('date','desc');

  for (var field in fieldsMapping) {
    if (fieldsMapping.hasOwnProperty(field) && options[field] !== undefined) {
      bodyBuilder = bodyBuilder.filter('term', fieldsMapping[field], options[field]);
    }
  }

  return bodyBuilder.build();
}

module.exports = {
  byFields: getEntriesByField
};