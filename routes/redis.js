var express = require("express");
const app = require("../app");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27020/";
const bodyParser = require("body-parser");
var cors = require("cors");
//import { createClient } from 'redis';
var redis = require("redis");
var axios = require("axios");

const client = redis.createClient();

client.on('error', (err) => console.log('Redis Client Error', err));


/* GET all tweets. */
router.get("/test", async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  await client.connect();
  await client.set('test', '1');
  const value = await client.get('test');
  res.send("1 document inserted on test: " + value);

});

router.get("/datausa1", async function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    const {data} = await axios.get("https://datausa.io/api/data?measures=Average%20Wage,Average%20Wage%20Appx%20MOE&drilldowns=Detailed%20Occupation")
    res.json(data)
    await client.connect();
    await client.set("datausa1", JSON.stringify(data), {
        EX: 10,
    });
});

/* GET top 10 hashtags. */
router.get("/hashtags", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  var result1;
  MongoClient.connect(url, async function (err, db) {
    if (err) throw err;
    var dbo = db.db("tweets");
    result1 = await dbo
      .collection("tweet")
      .aggregate([
        { $match: {} },
        { $unwind: "$entities.hashtags" },
        { $group: { _id: "$entities.hashtags.text", count: { $count: {} } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ])
      .toArray(function (err, result) {
        if (err) throw err;
        result1 = result;
        res.send(result);
        db.close();
      });
  });
});

module.exports = router;
