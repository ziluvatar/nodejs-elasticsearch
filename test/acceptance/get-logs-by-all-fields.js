var expect = require('chai').expect;
var request = require('../util/request');
var store = require('../util/store');
var buildLogEntry = store.buildEntry;


describe('GET /logs?{user_name,connection,ip,user_id}', function() {

  beforeEach(function (done) {
    store.save([
      buildLogEntry({ connection: 'c1', user_name: 'un1', ip: '1.1.1.1', user_id: 'u1' }),
      buildLogEntry({ connection: 'c1', user_name: 'un2', ip: '1.1.1.1', user_id: 'u1' }),
      buildLogEntry({ connection: 'c1', user_name: 'un1', ip: '1.1.1.2', user_id: 'u1' }),
      buildLogEntry({ connection: 'c1', user_name: 'un1', ip: '1.1.1.1', user_id: 'u2' }),
      buildLogEntry({ connection: 'c2', user_name: 'un1', ip: '1.1.1.1', user_id: 'u1' })
    ], done);
  });

  afterEach(function (done) {
    store.drop(done);
  });

  it('returns client entries searching by all fields', function(done) {
    request.validGet('/logs?connection=c1&user_name=un1&ip=1.1.1.1&user_id=u1')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 1, total: 1 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ id: "1", connection: 'c1', user_name: 'un1', ip: '1.1.1.1', user_id: 'u1' })
        ]);
        done(err);
      });
  });

  it('does not return entries by connection when there are not logs for that user', function(done) {
    request.validGet('/logs?connection=c0&user_name=un1&ip=1.1.1.1&user_id=u1')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 0, total: 0 });
        expect(res.body).to.have.property('logs').and.be.empty;
        done(err);
      });
  });

  it('returns 401 http error code when there is a problem with the JWT used', function(done) {
    request.unauthorizedGet('/logs?connection=c1').end(done);
  });

});

