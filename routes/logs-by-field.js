var config = require('config');
var esClient = require('../support/es-client');
var esIndex = config.get('elasticsearch.index');
var esType = config.get('elasticsearch.type');
var pageSize = config.get('api.pageSize');
var BodyBuilder = require('bodybuilder');
var validator = require('../support/validator');

const fieldsMapping = {
  user_name: 'user_name',
  connection: 'connection',
  user_id: 'user_id',
  ip: 'ip'
};

function buildOptions(req) {
  var options = {
    pagination: {
      start: parseInt(req.query.start || 0),
      pageSize: parseInt(req.query.limit || pageSize)
    },
    period: {
      from: req.query.from,
      to: req.query.to
    },
    security: {
      client_id: req.user.aud
    },
    response: {},
    user_name: req.query.user_name,
    connection: req.query.connection,
    user_id: req.query.user_id,
    ip: req.query.ip
  };
  if (req.query.fields) {
    var fieldList = req.query.fields.split(',');
    if (req.query.exclude_fields === 'true') {
      options.response.excludeFields = fieldList;
    } else {
      options.response.includeFields = fieldList;
    }
  }

  return options
}

function validateInput(req) {
  var errors = [];
  if (!validator.isEmptyOrDate(req.query.from)) {
    errors.push({ code: 'invalid.param.from', message: 'Date format invalid, expected: YYYY-MM-DDTHH:mm:ss.SSSZ' })
  }
  if (!validator.isEmptyOrDate(req.query.to)) {
    errors.push({ code: 'invalid.param.to', message: 'Date format invalid, expected: YYYY-MM-DDTHH:mm:ss.SSSZ' })
  }
  return errors;
}

function getEntriesByField(req, res) {
  var errors = validateInput(req);
  if (errors.length > 0) {
    return res.status(400).json({ errors: errors });
  }

  var options = buildOptions(req);

  esClient
    .search({
      index: esIndex,
      type: esType,
      body: buildESQuery(options),
      _sourceInclude: options.response.includeFields,
      _sourceExclude: options.response.excludeFields
    })
    .then(function(data) {
      res.json({
        start: options.pagination.start,
        total: data.hits.total,
        length: data.hits.hits.length,
        limit: options.pagination.pageSize,
        logs: data.hits.hits.map(h => h._source)
      });
    })
    .catch(function(err) {
      res.sendStatus(500);
      console.error(err);
    });
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

  if (options.period.from !== undefined) {
    bodyBuilder = bodyBuilder.filter('range', 'date', { "gte" : options.period.from });
  }
  if (options.period.to !== undefined) {
    bodyBuilder = bodyBuilder.filter('range', 'date', { "lte" : options.period.to });
  }

  return bodyBuilder.build();
}

module.exports = {
  byFields: getEntriesByField
};