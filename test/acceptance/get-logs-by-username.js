var expect = require('chai').expect;
var basicGetRequest = require('../util/request').validGetRequest;
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
    basicGetRequest('/logs?user_name=user1')
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
    basicGetRequest('/logs?user_name=user3')
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

