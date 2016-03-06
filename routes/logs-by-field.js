var config = require('config');
var esClient = require('../support/es-client');
var esIndex = config.get('elasticsearch.index');
var esType = config.get('elasticsearch.type');
var pageSize = config.get('api.pageSize');
var BodyBuilder = require('bodybuilder');

const fieldsMapping = {
  user_name: 'user_name',
  connection: 'connection',
  user_id: 'user_id'
};

function getEntriesByField(req, res) {
  function searchResolve(data) {
    res.json({
      start: 0,
      total: data.hits.total,
      length: data.hits.hits.length,
      limit: pageSize,
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
      body: buildESQuery(req)
    })
    .then(searchResolve)
    .catch(searchReject);
}

function buildESQuery(req) {
  var bodyBuilder = new BodyBuilder().size(pageSize).sort('date','desc');
  bodyBuilder = bodyBuilder.filter('term','client_id',req.user.aud);

  for (var field in fieldsMapping) {
    if (fieldsMapping.hasOwnProperty(field) && req.query[field] !== undefined) {
      bodyBuilder = bodyBuilder.filter('term', fieldsMapping[field], req.query[field]);
    }
  }

  return bodyBuilder.build();
}

module.exports = {
  byFields: getEntriesByField
};