var esLogSearcher = require('../elasticsearch/es-logs');

function getEntryById(req, res) {
  function getResolve(data) {
    var output = { id: data._id };
    Object.assign(output, data._source);
    res.json(output);
  }

  function getReject(err) {
    if (err.status === 404) {
      res.sendStatus(err.status);
    } else {
      res.sendStatus(500);
      console.error(err);
    }
  }

  esLogSearcher
    .getById({
      id: req.params.id,
      security: {
        client_id: req.user.aud
      }
    })
    .then(getResolve)
    .catch(getReject);
}

module.exports = {
  byId: getEntryById
};