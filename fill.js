const faker = require('faker');
const async = require('async');
const MongoClient = require('mongodb').MongoClient;
var ProgressBar = require('progress');

const N = parseInt(process.argv[2]) || 100000;
const bar = new ProgressBar(':current/:total :bar :elapsed [:eta]', { total: N });

MongoClient.connect('mongodb://localhost:27017/loadtest', function(err, db) {
  if (err) {
    return console.error(err);
  }

  console.log("Connected to server");

  const collection = db.collection('loadtest');

  collection.drop(function(err) {
    if (err) {
      return console.error(err);
    }

    async.timesSeries(N, function(n, next) {
      collection.insert([faker.helpers.createCard()], function(err) {
        bar.tick();
        next(err);
      });
    }, function(err) {
      db.close();
      console.log('complete');
      if (err) {
        return console.error(err);
      }
    });
  });
});
