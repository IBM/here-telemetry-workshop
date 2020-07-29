/*
 * Copyright (c) 2019 HERE Europe B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 * License-Filename: LICENSE
 */

/*
 * Data Producer for eventhub ( DataStream Template)
 */

'use strict';

const request = require('request');
const config = require('./config.json');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: config.kafka.clinetId,
  brokers: config.kafka.brokers,
})

const producer = kafka.producer();

//HERE_API_LOGS DB cleanup before each run so a fresh view is available each time.
function cleanupDB() {
  const MongoClient = require("mongodb").MongoClient;
  const databaseId = "here";
  const url = `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.uri}`;

  const client = new MongoClient(url, {useUnifiedTopology: true});
  client.connect().then((client) => {
    const db = client.db(databaseId);
    db.collection("here").drop((err, ok) => {
      if (err) console.log("Collection Not found");
      if (ok) console.log("Collection Deleted");
    })
    client.close();
  }).catch((err) => {
    console.log(err);
  });
}

// Route Matching API to help with fetching co-ordinates of nearest road for given point.
function getNearsetRoadLatLon(lat, lon) {
  return new Promise(resolve => {
    var payload1 = '<gpx xmlns="http://www.topografix.com/GPX/1/1" creator="MapSource 6.16.3" version="1.1"     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"><trk><trkseg><trkpt';
    var payload2 = '></trkpt></trkseg></trk></gpx>';


    var finalPayLoad = payload1 + " lat=\"" + lat + "\"" + " lon=\"" + lon + "\"" + payload2;
    request.post({
        url: 'https://m.fleet.ls.hereapi.com/2/matchroute.json?routemode=car&apiKey=' + config.here_credentials.api_key,
        body: finalPayLoad,
        headers: {
          'Content-Type': 'text/xml'
        }
      },
      function (_error, _response, body) {
        var jsonObject = {};
        try {
          var parsedBody = JSON.parse(body);
          jsonObject.latMatched = parsedBody.TracePoints[0].latMatched;
          jsonObject.lonMatched = parsedBody.TracePoints[0].lonMatched;
          resolve(jsonObject);
        } catch (_errorResp) {
          jsonObject.latMatched = lat;
          jsonObject.lonMatched = lon;
          resolve(jsonObject);
        }
      });
  });
}

//Generalized Random number generator for given range.
function chooseRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//Generate random data, and send to eventhub.
async function generateVehicleData(key) {

  let jsonresp = await getNearsetRoadLatLon(config.vehicle_map[key].lat, config.vehicle_map[key].lon);
  let nextLat = jsonresp.latMatched + chooseRandomNumber(config.next_move[key].latLower, config.next_move[key].latHigher) / 10000;
  let nextLon = jsonresp.lonMatched + chooseRandomNumber(config.next_move[key].lonLower, config.next_move[key].lonHigher) / 10000;

  if (config.vehicle_map[key].lat == nextLat && config.vehicle_map[key].lon == nextLon) {
    //Vehicle is stuck into same position in simulatoion, trying to move it a little far .
    config.vehicle_map[key].lat = jsonresp.latMatched + chooseRandomNumber(config.next_move[key].latLower - 2, config.next_move[key].latHigher + 2) / 10000;
    config.vehicle_map[key].lon = jsonresp.lonMatched + chooseRandomNumber(config.next_move[key].lonLower - 2, config.next_move[key].lonHigher + 2) / 10000;
  } else {
    config.vehicle_map[key].lat = nextLat;
    config.vehicle_map[key].lon = nextLon;
  }


  //prepare ehub-msg;
  var url = "/v1/revgeocode?at=" + config.vehicle_map[key].lat + "%2C" + config.vehicle_map[key].lon + "%2C250&mode=retrieveAddresses&maxresults=1&gen=9";
  var ehMsg = {};
  ehMsg.uid = "uid_geocode_v_" + key + "_" + (Math.round(new Date() / 1000)).toString();
  ehMsg.api = "geocoder";
  ehMsg.url = url;
  ehMsg.method = "get";

  ehMsg.vehicleId = config.markers[key].legend;
  ehMsg.latMatched = jsonresp.latMatched;
  ehMsg.lonMatched = jsonresp.lonMatched;
  ehMsg.engineTemperature = chooseRandomNumber(55, 100);
  ehMsg.engineRPM = chooseRandomNumber(2000, 8000);
  ehMsg.engineLoad = chooseRandomNumber(5, 100);
  ehMsg.coolantTemperature = chooseRandomNumber(50, 200);

  const data = {
    body: ehMsg
  };

  // TODO: replace with kafka
  //send to event-hub .
  await sendToProducer(data);
  logOutput(key, ehMsg);
}
//display data over console.
function logOutput(key, ehMsg) {
  console.log(config.markers[key].legend + "," + ehMsg.latMatched + "," + ehMsg.lonMatched + "," + ehMsg.engineTemperature + "," + ehMsg.engineRPM + "," + ehMsg.engineLoad + "," + ehMsg.coolantTemperature);
}

async function sendToProducer(data) {
  await producer.connect();
  await producer.send({
    topic: "test",
    messages: [
      { key: data.uid, value: JSON.stringify(data) }
    ]
  })
 
  await producer.disconnect();
}

//default set to 5 vehicle 
let vehicleCount = 5;
if (process.argv.length > 2) {
  var arg;
  try {
    arg = parseInt(process.argv[2], 10);
    if (typeof arg == 'number' && !isNaN(arg)) {
      if (arg > 10) {
        console.log("Max 10 vehicle can be simulated!");
        vehicleCount = 10;
      } else {
        vehicleCount = arg;
        console.log("producer will simulate [" + vehicleCount + "] vehicles");
      }
    } else {
      console.log("producer will simulate [" + vehicleCount + "] vehicles");
    }
  } catch (error) {
    console.log("only numeric count 1-10 is allowed, simulating 5 vehicles.");
  }

}
//before each run, wipe entries from DB.
cleanupDB();

// Generate data for given number of vehicle every 'X' seconds as configured.
for (var key = 0; key < vehicleCount; key++) {
  setInterval(generateVehicleData, config.sampling_time_ms, key);
}
