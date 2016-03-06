var request = require("supertest");
var app = require('../../app');
var tokenBuilder = require('../util/token-builder');

module.exports = {
  validGetRequest: function (url) {
    return request(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + tokenBuilder.validToken())
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8');
  }
};