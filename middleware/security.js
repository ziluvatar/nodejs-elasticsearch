var config = require('config');
var jwt = require('express-jwt');

var authenticate = jwt({
  secret: new Buffer(config.get('api.security.auth-client-secret'), 'base64'),
  audience: config.get('api.security.auth-client-id')
});

var unauthorizedErrorHandler = function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ errors: [{ code: err.code, message: err.message }] });
  } else {
    next(err);
  }
};

module.exports = {
  verify: authenticate,
  errorHandler: unauthorizedErrorHandler
};
