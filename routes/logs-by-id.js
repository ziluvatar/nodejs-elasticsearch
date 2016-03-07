var config = require('config');
var esClient = require('../support/es-client');
var esIndex = config.get('elasticsearch.index');
var esType = config.get('elasticsearch.type');

function getEntryById(req, res) {
  function getResolve(data) {
    if (data._source.client_id === req.user.aud) {
      res.json(data._source);
    } else {
      res.sendStatus(404);
    }
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