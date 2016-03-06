var request = require("supertest");
var app = require('../../app');
var tokenBuilder = require('../util/token-builder');

module.exports = {
  validGet: function (url) {
    return request(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + tokenBuilder.validToken())
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8');
  },
  unauthorizedGet: function (url) {
    return request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect(401, { error: { code: "credentials_required", message: "No authorization token was found" } })
      .expect('Content-Type', 'application/json; charset=utf-8');
  },
  notFoundGet: function(url) {
    return request(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + tokenBuilder.validToken())
      .expect(404);
  }
};