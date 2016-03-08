var config = require('config');
var elasticsearch = require('elasticsearch');

module.exports = new elasticsearch.Client({
  host: config.get('elasticsearch.host'),
  log: config.get('elasticsearch.log'),
  maxSockets: config.get('elasticsearch.maxSockets')
});