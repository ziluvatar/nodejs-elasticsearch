var expect = require('chai').expect;
var request = require("supertest");
var app = require('../../app');
var elasticsearch = require('elasticsearch');
var config = require('config');
var tokenBuilder = require('../util/token-builder');

var client = new elasticsearch.Client({
  host: config.get('elasticsearch.host'),
  log: config.get('elasticsearch.log')
});
var esIndex = config.get('elasticsearch.index');
var esType = config.get('elasticsearch.type');

describe('GET /logs/{id}', function() {

  before(function (done) {
    client.bulk({
      body: [
        { delete: { _index: esIndex, _type: esType, _id: 1 } },
        { index:  { _index: esIndex, _type: esType, _id: 1 } },
        buildLogEntry()
      ]
    }, done);
  });

  after(function (done) {
    client.delete({ index: esIndex, type: esType, id: '1' }, done);
  });

  it('returns an entry when it exists', function(done) {
    request(app)
      .get('/logs/1')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + tokenBuilder.validToken())
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
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

function buildLogEntry() {
  return {
    type: 'ss',
    date: '2016-02-23T19:57:29.532Z',
    client_id: "AaiyAPdpYdesoKnqjj8HJqRn4T5titww",
    client_name: "My application Name",
    ip: "190.254.209.19",
    details: {},
    user_id: "auth0|56c75c4e42b6359e98374bc2"
  };
}
