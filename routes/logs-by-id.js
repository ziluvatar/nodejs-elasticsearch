var config = require('config');
var esClient = require('../support/es-client');
var esIndex = config.get('elasticsearch.index');
var esType = config.get('elasticsearch.type');

function getEntryById(req, res) {
  function getResolve(data) {
    res.json(data._source);
  }

  function getReject(err) {
    if (err.status === 404) {
      res.sendStatus(err.status);
    } else {
      res.sendStatus(500);
      console.error(err);
    }
  }

  esClient
    .get({
      index: esIndex,
      type: esType,
      id: req.params.id
    })
    .then(getResolve)
    .catch(getReject);
}

module.exports = {
  byId: getEntryById
};