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
  await client.quit();

});

router.get("/datausa1", async function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    await client.connect();
    const datausa1 = await client.get("datausa1", (error, datausa1)=>{
      if(error) console.error(error);
    });

    if(datausa1 != null){
      console.log("got cache!");
      await client.quit();
      return res.json(JSON.parse(datausa1));
    }

    const {data} = await axios.get("https://datausa.io/api/data?measures=Average%20Wage,Average%20Wage%20Appx%20MOE&drilldowns=Detailed%20Occupation")
    await client.set("datausa1", JSON.stringify(data), {
      EX: 300,
    });
    console.log("cached!");
    res.json(data)
    await client.quit();

});

router.get("/datausa1/split", async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  await client.connect();
  const {data} = await axios.get("https://datausa.io/api/data?measures=Average%20Wage,Average%20Wage%20Appx%20MOE&drilldowns=Detailed%20Occupation")
  var list = data["data"]
  
  const retList = await client.lRange("datausa1list", 0, -1).catch((error)=>{
    console.log(error);
  });
  
  if(retList != null && retList.length > 0){
    await client.quit();
    return res.json(retList);
  }

   for (let i = 0; i < list.length; i++) {
     await client.lPush("datausa1list", JSON.stringify(list[i]), {
       EX:300,
     });
   }
   
  await client.quit();
  
  res.json("{\"status\":\"list stored\"}") 
  
});

module.exports = router;
