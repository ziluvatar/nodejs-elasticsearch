var config = require('config');
var pageSize = config.get('api.pageSize');
var validator = require('../support/validator');
var esLogSearcher = require('../elasticsearch/es-logs');

const apiDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
const apiSortFields = ['date','type','user_name','connection','user_id','ip','client_name'];
const apiSortModes = ['asc','desc'];

function getEntriesByField(req, res) {
  var errors = validateInput(req);
  if (errors) {
    return res.status(400).json({ errors: validator.normalizeErrors(errors) });
  }

  var options = buildOptions(req);

  esLogSearcher
    .search(options)
    .then(sendJsonData)
    .catch(function (err) {
      res.sendStatus(500);
      return console.error(err);
    });

  function sendJsonData(data) {
    res.json({
      start: options.pagination.start,
      total: data.hits.total,
      length: data.hits.hits.length,
      limit: options.pagination.pageSize,
      logs: data.hits.hits.map(hit => {
        var output = { id: hit._id };
        Object.assign(output, hit._source);
        return output;
      })
    });
  }
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

  return req.validationErrors();
}

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


module.exports = {
  byFields: getEntriesByField
};