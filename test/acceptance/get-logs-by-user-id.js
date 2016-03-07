var expect = require('chai').expect;
var request = require('../util/request');
var store = require('../util/store');
var buildLogEntry = store.buildEntry;


describe('GET /logs?{user_id}', function() {

  beforeEach(function (done) {
    store.save([
      buildLogEntry({ user_id: 'u1', date: '2016-02-21T00:00:00.000Z' }),
      buildLogEntry({ user_id: 'u1', date: '2016-02-22T00:00:00.000Z', client_id: "anotherClientId" }),
      buildLogEntry({ user_id: 'u1', date: '2016-02-23T00:00:00.000Z' }),
      buildLogEntry({ user_id: 'u2', date: '2016-02-24T00:00:00.000Z' })
    ], done);
  });

  afterEach(function (done) {
    store.drop(done);
  });

  it('returns client entries searching by user_id when it exists', function(done) {
    request.validGet('/logs?user_id=u1')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 2, total: 2 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ user_id: 'u1', date: '2016-02-23T00:00:00.000Z' }),
          buildLogEntry({ user_id: 'u1', date: '2016-02-21T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('does not return entries by connection when there are not logs for that user', function(done) {
    request.validGet('/logs?user_id=u0')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 0, total: 0 });
        expect(res.body).to.have.property('logs').and.be.empty;
        done(err);
      });
  });

  it('returns 401 http error code when there is a problem with the JWT used', function(done) {
    request.unauthorizedGet('/logs?user_id=u1').end(done);
  });

});

