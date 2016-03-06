var expect = require('chai').expect;
var validGetRequest = require('../util/request').validGetRequest;
var store = require('../util/store');
var buildLogEntry = store.buildEntry;


describe('GET /logs', function() {

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
    validGetRequest('/logs')
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
      validGetRequest('/logs')
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

});