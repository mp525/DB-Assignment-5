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
    await client.connect();
    client.get("datausa1", (error, datausa1)=>{
      if(error) console.error(error);
      if(datausa1 != null){
        return res.json(JSON.parse(datausa1));
      }
    });

    const {data} = await axios.get("https://datausa.io/api/data?measures=Average%20Wage,Average%20Wage%20Appx%20MOE&drilldowns=Detailed%20Occupation")
    await client.set("datausa1", JSON.stringify(data), {
      EX: 10,
    });
    
    res.json(data)
    
});

router.get("/datausa1/split", async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  await client.connect();
  /* client.get("datausa1", (error, datausa1)=>{
    if(error) console.error(error);
    if(datausa1 != null){
      return res.json(JSON.parse(datausa1));
    }
  }); */

  const {data} = await axios.get("https://datausa.io/api/data?measures=Average%20Wage,Average%20Wage%20Appx%20MOE&drilldowns=Detailed%20Occupation")
  /* await client.set("datausa1", JSON.stringify(data), {
    EX: 10,
  });
  
  res.json(data) */
  
});

module.exports = router;
