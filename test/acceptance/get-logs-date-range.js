var expect = require('chai').expect;
var request = require('../util/request');
var store = require('../util/store');
var buildLogEntry = store.buildEntry;


describe('GET /logs?{from,to}', function() {

  var recentDateTime = new Date().toISOString();

  beforeEach(function (done) {
    store.save([
      buildLogEntry({ date: recentDateTime }),
      buildLogEntry({ date: '2016-02-23T00:00:00.000Z' }),
      buildLogEntry({ date: '2016-02-22T00:00:00.000Z' }),
      buildLogEntry({ date: '2016-02-21T00:00:00.000Z', client_id: "anotherClientId" }),
      buildLogEntry({ date: '2016-02-20T00:00:00.000Z' })
    ], done);
  });

  afterEach(function (done) {
    store.drop(done);
  });

  it('returns client log entries in date range', function(done) {
    request.validGet('/logs?from=2016-02-20T23:59:59.999Z&to=2016-02-24T00:00:00.000Z')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.have.property('start').and.be.equal(0);
        expect(res.body).to.have.property('total').and.be.equal(2);
        expect(res.body).to.have.property('length').and.be.equal(2);
        expect(res.body).to.have.property('limit').and.be.equal(3);
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ date: '2016-02-23T00:00:00.000Z' }),
          buildLogEntry({ date: '2016-02-22T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('returns all client entries up to "to" date when there is no "from" defined', function(done) {
    request.validGet('/logs?to=2016-02-22T23:59:59.999Z')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 2, total: 2 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ date: '2016-02-22T00:00:00.000Z' }),
          buildLogEntry({ date: '2016-02-20T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('returns entries from initial date up to now when there is no "to" defined', function(done) {
    request.validGet('/logs?from=2016-02-20T23:59:59.999Z')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 3, total: 3 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ date: recentDateTime }),
          buildLogEntry({ date: '2016-02-23T00:00:00.000Z' }),
          buildLogEntry({ date: '2016-02-22T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('does not return entries when there are not logs for that user during the date range', function(done) {
    request.validGet('/logs?from=2016-02-10T23:59:59.999Z&to=2016-02-19T00:00:00.000Z')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 0, total: 0 });
        expect(res.body).to.have.property('logs').and.be.empty;
        done(err);
      });
  });

  it('returns bad request error when "to" or "from" date format is incorrect', function(done) {
    request.badGet('/logs?from=aaaa&to=2016-02-20')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.have.property('errors').and.deep.equal([
          { code: 'invalid.param.from', message: 'Date format invalid, expected: YYYY-MM-DDTHH:mm:ss.SSSZ' },
          { code: 'invalid.param.to', message: 'Date format invalid, expected: YYYY-MM-DDTHH:mm:ss.SSSZ' }
        ]);
        done(err);
      });
  });

});