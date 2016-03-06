var config = require('config');
var jwt = require('jsonwebtoken');

const secret = new Buffer(config.get("api.security.auth-client-secret"), 'base64');
const client_id = config.get("api.security.auth-client-id");

function buildValidToken() {
  return jwt.sign({}, secret, {
    issuer: "https://test0.com/",
    subject: "auth0|user1",
    expiresIn: "1h",
    audience: client_id
  });
}

module.exports = {
  validToken: buildValidToken
};