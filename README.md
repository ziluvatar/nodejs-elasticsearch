Logs API
--------

# What is this?

This is an example of building a NodeJS Rest API to access to logs which are stored in elasticsearch.

# How to use it?

Previously, you need to install elasticsearch (I used v2.2)

You can configure where it is in `config/default.json`, by default it will use `http://localhost:9200`

You can run the tests executing: `npm test`, keep in mind this uses that elasticsearch instance as well, but a different index.

To run the API server: `npm start`, the server will run in http://localhost:3000

You can see the API documentation here: http://docs.logseduardods.apiary.io

# Technical Notes

* API using express