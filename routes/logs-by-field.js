var config = require('config');
var esClient = require('../support/es-client');
var esIndex = config.get('elasticsearch.index');
var esType = config.get('elasticsearch.type');
var pageSize = config.get('api.pageSize');
var BodyBuilder = require('bodybuilder');

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

  if (req.query.user_name !== undefined) {
    bodyBuilder = bodyBuilder.filter('term', 'user_name', req.query.user_name);
  }

  return bodyBuilder.build();
}

module.exports = {
  byFields: getEntriesByField
};