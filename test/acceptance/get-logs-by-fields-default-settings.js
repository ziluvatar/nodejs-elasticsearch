var expect = require('chai').expect;
var request = require("supertest");
var app = require('../../app');
var config = require('config');
var tokenBuilder = require('../util/token-builder');
var store = require('../util/store');


describe('GET /logs?{fields}', function() {

  beforeEach(function (done) {
    store.save([
      buildLogEntry({ user_name: 'user1', type: 's', date: '2016-02-23T00:00:00.000Z' }),
      buildLogEntry({ user_name: 'user1', date: '2016-02-22T00:00:00.000Z' }),
      buildLogEntry({ user_name: 'user1', date: '2016-02-21T00:00:00.000Z', client_id: "anotherClientId" }),
      buildLogEntry({ user_name: 'user2' })
    ], done);
  });

  afterEach(function (done) {
    store.drop(done);
  });

  it('returns all client entries default sorted (date descending) when searching without any query param', function(done) {
    request(app)
      .get('/logs')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + tokenBuilder.validToken())
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res){
        expect(res.body).to.have.property('start').and.be.equal(0);
        expect(res.body).to.have.property('total').and.be.equal(3);
        expect(res.body).to.have.property('length').and.be.equal(3);
        expect(res.body).to.have.property('limit').and.be.equal(3);
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ user_name: 'user1', type: 's', date: '2016-02-23T00:00:00.000Z' }),
          buildLogEntry({ user_name: 'user1', date: '2016-02-22T00:00:00.000Z' }),
          buildLogEntry({ user_name: 'user2' })
        ]);
        done(err);
      });
  });

  it('returns first page when there are more results than default page size', function(done) {
    store.save([buildLogEntry()], function() {
      request(app)
        .get('/logs')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + tokenBuilder.validToken())
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end(function(err, res){
          expect(res.body).to.have.property('start').and.be.equal(0);
          expect(res.body).to.have.property('total').and.be.equal(4);
          expect(res.body).to.have.property('length').and.be.equal(3);
          expect(res.body).to.have.property('limit').and.be.equal(3);
          expect(res.body).to.have.property('logs').and.deep.equal([
            buildLogEntry({ user_name: 'user1', type: 's', date: '2016-02-23T00:00:00.000Z' }),
            buildLogEntry({ user_name: 'user1', date: '2016-02-22T00:00:00.000Z' }),
            buildLogEntry()
          ]);
          done(err);
        });
    });
  });

  it('returns client entries searching by username when it exists', function(done) {
    request(app)
      .get('/logs?user_name=user1')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + tokenBuilder.validToken())
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res){
        expect(res.body).to.have.property('start').and.be.equal(0);
        expect(res.body).to.have.property('total').and.be.equal(2);
        expect(res.body).to.have.property('length').and.be.equal(2);
        expect(res.body).to.have.property('limit').and.be.equal(3);
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ user_name: 'user1', type: 's', date: '2016-02-23T00:00:00.000Z' }),
          buildLogEntry({ user_name: 'user1', date: '2016-02-22T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('does not return entries by username when there are not logs for that user', function(done) {
    request(app)
      .get('/logs?user_name=user3')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer ' + tokenBuilder.validToken())
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res){
        expect(res.body).to.have.property('start').and.be.equal(0);
        expect(res.body).to.have.property('total').and.be.equal(0);
        expect(res.body).to.have.property('length').and.be.equal(0);
        expect(res.body).to.have.property('limit').and.be.equal(3);
        expect(res.body).to.have.property('logs').and.be.empty;
        done(err);
      });
  });



});

function buildLogEntry(ext) {
  var extension = ext || {};
  return {
    type: extension.type || 'ss',
    date: extension.date || '2016-01-01T00:00:00.000Z',
    client_id: extension.client_id || config.get('api.security.auth-client-id'),
    client_name: "My application Name",
    ip: extension.ip || "190.254.209.19",
    details: {},
    user_id: extension.user_id || "auth0|56c75c4e42b6359e98374bc2",
    user_name: extension.user_name || "myuser",
    connection: extension.connection || "connection1",
    user_agent: extension.user_agent || "userAgent1"
  };
}
