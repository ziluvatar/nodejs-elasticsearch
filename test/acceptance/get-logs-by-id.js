var expect = require('chai').expect;
var request = require("supertest");
var app = require('../../app');
var config = require('config');
var tokenBuilder = require('../util/token-builder');

var validGetRequest = require('../util/request').validGetRequest;
var store = require('../util/store');
var buildLogEntry = store.buildEntry;


describe('GET /logs/{id}', function() {

  beforeEach(function (done) {
    store.save([buildLogEntry()], done);
  });

  afterEach(function (done) {
    store.drop(done);
  });

  it('returns an entry when it exists', function(done) {
    validGetRequest('/logs/1')
      .end(function(err, res){
        expect(res.body).to.eql(buildLogEntry());
        done(err);
      });
  });

  it('returns 401 http error code when there is a problem with the JWT used', function(done) {
    request(app)
      .get('/logs/1')
      .set('Accept', 'application/json')
      .expect(401)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res) {
        expect(res.body).to.eql({ error: { code: "credentials_required", message: "No authorization token was found" } });
        done(err);
      });
  });

  it('returns 404 http error code when entry is not found', function(done) {
    request(app)
      .get('/logs/2')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + tokenBuilder.validToken())
      .expect(404)
      .end(done);
  });

});
