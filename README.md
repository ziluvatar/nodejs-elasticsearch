Logs API
--------

# What is this?

This is an example of building a NodeJS Rest API to access to logs which are stored in elasticsearch.

# How to use it?

## Pre-requisites:

### 1. Install elasticsearch

I used elasticsearch v2.2.

You can configure where elasticsearch is in `config/default.json`, by default it will use `http://localhost:9200`.

### 2. Create an Auth app

You can go to [Auth0](http://www.auth0.com) to create it. After that set these environment variables 
(only to run it, you don't need this for testing):

```
AUTH0_CLIENT_ID=myAppClientId
AUTH0_CLIENT_SECRET=myAppClientSecret
```

## Tests

You can run the tests executing: `npm test`, keep in mind this uses that elasticsearch instance as well, but a different index.

## Run API Server

To run the API server: `npm start`, the server will run in http://localhost:3000

You can see the API documentation here: http://docs.logseduardods.apiary.io

# Technical Notes

* API using express
* Authorization using expres-jwt
* Express-validator to check the format of some query parameters
* Winston and Morgan for logging
* Script to create index & mapping in elasticsearch (if needed) when you execute tests or run the server.
  It is executed automatically on `pretest` and `prestart` phases.
* Script to populate database `scripts/create-es-content.js`, you need to have set the `AUTH0_CLIENT_ID` environment variable previously before you run it