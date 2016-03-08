var expect = require('chai').expect;
var request = require('../util/request');
var store = require('../util/store');
var buildLogEntry = store.buildEntry;


describe('GET /logs?{fields,exclude_fields}', function() {

  beforeEach(function (done) {
    store.save([
      buildLogEntry(),
      buildLogEntry({ client_id: "anotherClientId" })
    ], done);
  });

  afterEach(function (done) {
    store.drop(done);
  });

  it('returns only some fields when "fields" is set', function(done) {
    request.validGet('/logs?fields=user_name,connection')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 1, total: 1 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          { id: "1", user_name: 'myuser', connection: 'connection1' }
        ]);
        done(err);
      });
  });

  it('returns not excluded fields when "fields" is set and "exclude_fields" is true', function(done) {
    request.validGet('/logs?fields=user_name,connection&exclude_fields=true')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 1, total: 1 });

        var entry = buildLogEntry({ id: "1" });
        delete entry.user_name;
        delete entry.connection;
        expect(res.body).to.have.property('logs').and.deep.equal([
          entry
        ]);
        done(err);
      });
  });

  it('returns only some fields when "fields" is set and "exclude_fields" is false', function(done) {
    request.validGet('/logs?fields=user_name,connection&exclude_fields=false')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.include({ start: 0, limit: 3, length: 1, total: 1 });
        expect(res.body).to.have.property('logs').and.deep.equal([
          { id: "1", user_name: 'myuser', connection: 'connection1' }
        ]);
        done(err);
      });
  });

  it('returns 400 error when "exclude_fields" field is not valid', function(done) {
    request.badGet('/logs?exclude_fields=foo')
      .end(function(err, res){
        expect(err).to.be.null;
        expect(res.body).to.have.property('errors').and.deep.equal([
          { code: 'invalid.param.exclude_fields',
            message: 'values allowed: true, false',
            value: 'foo' }
        ]);
        done(err);
      });
  });

  it('returns 401 http error code when there is a problem with the JWT used', function(done) {
    request.unauthorizedGet('/logs?fields=user_name').end(done);
  });

});