var expect = require('chai').expect;
var request = require('../util/request');
var store = require('../util/store');
var buildLogEntry = store.buildEntry;


describe('GET /logs?{sort,mode}', function() {

  beforeEach(function (done) {
    store.save([
      buildLogEntry({ user_name: 'd', date: '2016-02-23T00:00:00.000Z' }),
      buildLogEntry({ user_name: 'a', date: '2016-02-22T00:00:00.000Z' }),
      buildLogEntry({ user_name: 'a', date: '2016-02-21T00:00:00.000Z', client_id: "anotherClientId" }),
      buildLogEntry({ user_name: 'b', date: '2016-02-20T00:00:00.000Z' }),
      buildLogEntry({ user_name: 'c', date: '2016-02-19T00:00:00.000Z' })
    ], done);
  });

  afterEach(function (done) {
    store.drop(done);
  });

  it('returns entries sorted by username with default mode (descending) when "mode" is not set', function(done) {
    request.validGet('/logs?sort=user_name')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 3, total: 4 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ user_name: 'd', date: '2016-02-23T00:00:00.000Z' }),
          buildLogEntry({ user_name: 'c', date: '2016-02-19T00:00:00.000Z' }),
          buildLogEntry({ user_name: 'b', date: '2016-02-20T00:00:00.000Z' })
        ]);
        done(err);
      });
  });


  it('returns entries sorted by username with descending mode when "mode" is set to "desc"', function(done) {
    request.validGet('/logs?sort=user_name&mode=desc')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 3, total: 4 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ user_name: 'd', date: '2016-02-23T00:00:00.000Z' }),
          buildLogEntry({ user_name: 'c', date: '2016-02-19T00:00:00.000Z' }),
          buildLogEntry({ user_name: 'b', date: '2016-02-20T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('returns entries sorted by user_name with ascending mode when "mode" is set to "asc"', function(done) {
    request.validGet('/logs?sort=user_name&mode=asc')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 3, total: 4 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ user_name: 'a', date: '2016-02-22T00:00:00.000Z' }),
          buildLogEntry({ user_name: 'b', date: '2016-02-20T00:00:00.000Z' }),
          buildLogEntry({ user_name: 'c', date: '2016-02-19T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('returns 400 error when "sort" field or "mode" are not valid', function(done) {
    request.badGet('/logs?sort=detail&mode=wrong')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.have.property('errors').and.deep.equal([
          { code: 'invalid.param.sort',
            message: 'sort fields: date, user_name, connection, user_id, ip, client_name',
            value: 'detail' },
          { code: 'invalid.param.mode',
            message: 'sort modes allowed: asc, desc',
            value: 'wrong' }
        ]);
        done(err);
      });
  });

  it('returns entries sorted by default order (date, descending) when "sort" is not defined', function(done) {
    request.validGet('/logs')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 3, total: 4 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          buildLogEntry({ user_name: 'd', date: '2016-02-23T00:00:00.000Z' }),
          buildLogEntry({ user_name: 'a', date: '2016-02-22T00:00:00.000Z' }),
          buildLogEntry({ user_name: 'b', date: '2016-02-20T00:00:00.000Z' })
        ]);
        done(err);
      });
  });

  it('returns 401 http error code when there is a problem with the JWT used', function(done) {
    request.unauthorizedGet('/logs?sort=user_name').end(done);
  });

});