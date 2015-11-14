const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const randomstring = require("randomstring");
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const JSONStream = require('JSONStream');

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs/2; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {
  MongoClient.connect('mongodb://localhost:27017/loadtest', function(err, db) {
    const app = express();
    const collection = db.collection('loadtest');

    app.get('/', function (req, res) {
      // collection.find({name: {$regex: `${randomstring.generate(1)}.*`}}).limit(10).stream().pipe(JSONStream.stringify(false)).pipe(res);
      collection.find({name: {$regex: `${randomstring.generate(1)}.*`}}).limit(10).toArray(function(err, docs) {
        res.send(JSON.stringify(docs));
      });
    });

    const server = app.listen(5000, function () {
      const host = server.address().address;
      const port = server.address().port;
      console.log('Example app listening at http://%s:%s', host, port);
    });
  });
}
