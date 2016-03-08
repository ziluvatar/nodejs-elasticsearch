var config = require('config');
var esClient = require('../support/es-client');
var esIndex = config.get('elasticsearch.index');
var esType = config.get('elasticsearch.type');
var pageSize = config.get('api.pageSize');
var BodyBuilder = require('bodybuilder');
var validator = require('../support/validator');

const apiDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
const apiSortFields = ['date','type','user_name','connection','user_id','ip','client_name'];
const apiSortModes = ['asc','desc'];

const filterFieldsMapping = {
  type: 'type',
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
    sort: {
      field: req.query.sort || 'date',
      mode: req.query.mode || 'desc'
    },
    response: {},
    user_name: req.query.user_name,
    connection: req.query.connection,
    user_id: req.query.user_id,
    ip: req.query.ip,
    type: req.query.type,
    user_agent: req.query.user_agent
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
  req.checkQuery('start', 'must be a number').optional().isInt();
  req.checkQuery('limit', 'must be a number').optional().isInt();
  req.checkQuery('from', 'date format invalid, expected: ' + apiDateFormat).optional().isValidDate(apiDateFormat);
  req.checkQuery('to', 'date format invalid, expected: ' + apiDateFormat).optional().isValidDate(apiDateFormat);
  req.checkQuery('sort', 'sort fields: ' + apiSortFields.join(', ')).optional().isIn(apiSortFields);
  req.checkQuery('mode', 'sort modes allowed: ' + apiSortModes.join(', ')).optional().isIn(apiSortModes);
  req.checkQuery('exclude_fields', 'values allowed: true, false').optional().isBoolean();
  req.checkQuery('ip', 'invalid ip').optional().isIP();

  var errors = req.validationErrors();
  if (errors) {
    return validator.normalizeErrors(errors);
  } else {
    return [];
  }
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

module.exports = {
  byFields: getEntriesByField
};