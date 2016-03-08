var expect = require('chai').expect;
var request = require('../util/request');
var store = require('../util/store');
var buildLogEntry = store.buildEntry;


describe('GET /logs?{username}', function() {

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

  it('returns client entries searching by username when it exists', function(done) {
    request.validGet('/logs?user_name=user1')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 2, total: 2 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ id: "1", user_name: 'user1', type: 's', date: '2016-02-23T00:00:00.000Z' }),
          buildLogEntry({ id: "2", user_name: 'user1', date: '2016-02-22T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('does not return entries by username when there are not logs for that user', function(done) {
    request.validGet('/logs?user_name=user3')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 0, total: 0 });
        expect(res.body).to.have.property('logs').and.be.empty;
        done(err);
      });
  });

  it('returns 401 http error code when there is a problem with the JWT used', function(done) {
    request.unauthorizedGet('/logs?user_name=user1').end(done);
  });

});

