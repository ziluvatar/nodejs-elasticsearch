var esClient = require('../support/es-client');
var config = require('config');
var esIndex = config.get('elasticsearch.index');

esClient.indices.exists({ index: esIndex }, function(err, exists){
  if (err) return console.error(err);

  if (exists) {
    console.log(`Elasticsearch index '${esIndex}' already exists. Skipping creation.`);
  } else {
    console.log(`Elasticsearch index '${esIndex}' not found, creating...`);
    createIndex(esIndex, esClient);
  }
});

function createIndex(index, client) {
  client.indices.create({
    index: index,
    body: require('./es-file-mapping.json')
  }, function(err){
    if (err) return console.error(err);
    console.log(`Elasticsearch index '${index}' created. Mapping applied.`);
  });
}


