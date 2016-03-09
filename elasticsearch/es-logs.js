var config = require('config');
var esClient = require('../support/es-client');
var esIndex = config.get('elasticsearch.index');
var esType = config.get('elasticsearch.type');
var BodyBuilder = require('bodybuilder');


const filterFieldsMapping = {
  type: 'type',
  user_name: 'user_name',
  connection: 'connection',
  user_id: 'user_id',
  ip: 'ip'
};

function search (options) {
  return esClient
    .search({
      index: esIndex,
      type: esType,
      body: buildESQuery(options),
      _sourceInclude: options.response.includeFields,
      _sourceExclude: options.response.excludeFields
    });
}


function buildESQuery(options) {
  var bodyBuilder = new BodyBuilder()
    .filter('term','client_id',options.security.client_id)
    .size(options.pagination.pageSize)
    .from(options.pagination.start)
    .sort(options.sort.field, options.sort.mode);

  for (var field in filterFieldsMapping) {
    if (filterFieldsMapping.hasOwnProperty(field) && options[field] !== undefined) {
      bodyBuilder.filter('term', filterFieldsMapping[field], options[field]);
    }
  }

  if (options.period.from !== undefined) {
    bodyBuilder.filter('range', 'date', { "gte" : options.period.from });
  }
  if (options.period.to !== undefined) {
    bodyBuilder.filter('range', 'date', { "lte" : options.period.to });
  }

  if (options.user_agent !== undefined) {
    bodyBuilder.query('match', 'user_agent', options.user_agent);
  }

  return bodyBuilder.build();
}

function getById(options) {

  return esClient
    .get({
      index: esIndex,
      type: esType,
      id: options.id
    })
    .then(function (data) {
      if (data._source.client_id === options.security.client_id) {
        return data;
      } else {
        return Promise.reject({status: 404});
      }
    });

}

module.exports = {
  search: search,
  getById: getById
};