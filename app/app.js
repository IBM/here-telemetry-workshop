// @ts-nocheck

const CosmosClient = require('@azure/cosmos').CosmosClient;
var express = require('express');
var app = express();

const config = require('./config');
var path = require('path');

const endpoint = config.endpoint;
const masterKey = config.primaryKey;

const HttpStatusCodes = { NOTFOUND: 404 };

const databaseId = config.database.id;
const containerId = config.container.id;

const client = new CosmosClient({ endpoint: endpoint, auth: { masterKey: masterKey } });

var port=process.env.PORT || 3000;

app.use(express.static('public'));


//add the router
app.use(express.static(__dirname + '/View'));
app.use(express.static(__dirname + '/Script'));
app.use(express.static(__dirname + '/img'));
app.use(express.static(__dirname + '/css'));

app.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', async function (req, res) {
   // const { result: results } = await queryContainerforLatLong();
    console.log("index page");
   res.sendFile(path.join(__dirname + '/index.html'));
   //res.sendFile('/index.html');
 });

 app.get('/graph', async function (req, res) {
    // const { result: results } = await queryContainerforLatLong();
     console.log("Graph page");
     res.sendFile(path.join(__dirname + '/View/graph.html'));
  });

 app.get('/clat', async function (req, res) {
    const { result: results } = await queryContainerforLatLong();
    console.log(results);
    res.json(results);

 }); 


app.get('/trucks', async function (req, res) {
    const { result: results } = await queryContainerforVid();
    console.log(results);
    res.json(results);
 });



app.get('/user/:id', async function (req, res) {
    const vid = req.params.id; 
    const { result: results } = await queryContainer(vid);
    console.log(results);
    res.json(results);
    //var resp = [{"StatusTime":"07-03-2019 07:44:22","Latitude":"40.7489","Longitude":"-73.9849"}]
    //res.json(resp);
   // res.send('Hello World');
 });
 

 app.get('/speedgraph/engineTemperature/:id', async function (req, res) {
    const vid = req.params.id; 
    const { result: results } = await engineTemperature(vid);
    console.log(results);
    res.json(results);
 });


 app.get('/speedgraph/engineRPM/:id', async function (req, res) {
    const vid = req.params.id; 
    const { result: results } = await engineRPM(vid);
    console.log(results);
    res.json(results);
 });


 app.get('/speedgraph/engineLoad/:id', async function (req, res) {
    const vid = req.params.id; 
    const { result: results } = await engineLoad(vid);
    console.log(results);
    res.json(results);
 });


 app.get('/speedgraph/coolantTemperature/:id', async function (req, res) {
    const vid = req.params.id; 
    const { result: results } = await coolantTemperature(vid);
    console.log(results);
    res.json(results);
 });


 function engineTemperature(vid) {
    // query to return time & engineTemperature
    const querySpec = {
        query: "SELECT TOP 100 c.id_tstamp as Timestamp,c.req_obj.engineTemperature FROM c where c.req_obj.vehicleId=@vid ORDER BY c.id_tstamp DESC",
        parameters: [
            {
                name: "@vid",
                value: vid
            }
        ]
        };
        console.log(querySpec.query);
        return client.database(databaseId).container(containerId).items.query(querySpec,{ enableCrossPartitionQuery: true }).toArray();
};


function engineRPM(vid) {
    // query to return time & engineRPM
    const querySpec = {
        query: "SELECT TOP 100 c.id_tstamp  as Timestamp,c.req_obj.engineRPM FROM c where c.req_obj.vehicleId=@vid ORDER BY c.id_tstamp DESC",
        parameters: [
            {
                name: "@vid",
                value: vid
            }
        ]
        };
        console.log(querySpec.query);
        return client.database(databaseId).container(containerId).items.query(querySpec,{ enableCrossPartitionQuery: true }).toArray();
};


function engineLoad(vid) {
    // query to return time & engineLoad
    const querySpec = {
        query: "SELECT TOP 100 c.id_tstamp  as Timestamp,c.req_obj.engineLoad FROM c where c.req_obj.vehicleId=@vid ORDER BY c.id_tstamp DESC",
        parameters: [
            {
                name: "@vid",
                value: vid
            }
        ]
        };
        console.log(querySpec.query);
        return client.database(databaseId).container(containerId).items.query(querySpec,{ enableCrossPartitionQuery: true }).toArray();
};


function coolantTemperature(vid) {
    // query to return time & coolantTemperature
    const querySpec = {
        query: "SELECT TOP 100 c.id_tstamp  as Timestamp,c.req_obj.coolantTemperature FROM c where c.req_obj.vehicleId=@vid ORDER BY c.id_tstamp DESC",
        parameters: [
            {
                name: "@vid",
                value: vid
            }
        ]
        };
        console.log(querySpec.query);
        return client.database(databaseId).container(containerId).items.query(querySpec,{ enableCrossPartitionQuery: true }).toArray();
}; 




function queryContainer(vid) {
    console.log(`Querying container:\n${config.container.id}`);

    // query to retrive one recodord of lat, lng based on latest statustime & id
    const querySpec = {
        query: "SELECT TOP 1 c.req_obj.latMatched,c.req_obj.lonMatched FROM c where c.req_obj.vehicleId=@vid ORDER BY c.id_tstamp DESC",
        parameters: [
            {
                name: "@vid",
                value: vid
            }
        ]
        };
        console.log(querySpec.query);
    //const { result: results } = client.database(databaseId).container(containerId).items.query(querySpec,{ enableCrossPartitionQuery: true }).toArray();
    return client.database(databaseId).container(containerId).items.query(querySpec,{ enableCrossPartitionQuery: true }).toArray();
};

function queryContainerforVid() {
    // query to return unique id
    const querySpec = {
        query: "SELECT DISTINCT VALUE c.req_obj.vehicleId FROM c"
        };
        console.log(querySpec.query);
        return client.database(databaseId).container(containerId).items.query(querySpec,{ enableCrossPartitionQuery: true }).toArray();
};


function queryContainerforLatLong() {
    // query to return unique id
    const querySpec = {
        query: "SELECT TOP 1 c.req_obj.latMatched,c.req_obj.lonMatched FROM c ORDER BY c.id_tstamp DESC"
        };
        console.log(querySpec.query);
        return client.database(databaseId).container(containerId).items.query(querySpec,{ enableCrossPartitionQuery: true }).toArray();
};

app.listen(port);
console.log('Server Listening at port'+port);

/* var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
}) */

/**
 * Exit the app with a prompt
 * @param {message} message - The message to display
 */
/* function exit(message) {
    console.log(message);
    console.log('Press any key to exit');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}

queryContainer()
   // .then(() => queryContainer())
    .then(() => { exit(`Completed successfully`); })
    .catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) }); */