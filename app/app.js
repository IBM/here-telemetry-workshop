// @ts-nocheck
var express = require('express');
var app = express();

const config = require('./config.json');
var path = require('path');

const MongoClient = require("mongodb").MongoClient;



const HttpStatusCodes = { NOTFOUND: 404 };



var port = process.env.PORT || 3000;

app.use(express.static('public'));


//add the router
app.use(express.static(__dirname + '/View'));
app.use(express.static(__dirname + '/Script'));
app.use(express.static(__dirname + '/img'));
app.use(express.static(__dirname + '/css'));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', async function(req, res) {
    // const { result: results } = await queryContainerforLatLong();
    console.log("index page");
    res.sendFile(path.join(__dirname + '/index.html'));
    //res.sendFile('/index.html');
});

app.get('/graph', async function(req, res) {
    // const { result: results } = await queryContainerforLatLong();
    console.log("Graph page");
    res.sendFile(path.join(__dirname + '/View/graph.html'));
});

app.get('/clat', async function(req, res) {
    console.log("making request");
    const results = await queryContainerforLatLong();
    console.log(results);
    res.json(results);

});


app.get('/trucks', async function(req, res) {
    const results = await queryContainerforVid();
    console.log(results);
    res.json(results);
});



app.get('/user/:id', async function(req, res) {
    const vid = req.params.id;
    const results = await queryContainer(vid);
    console.log(results);
    res.json(results);
    //var resp = [{"StatusTime":"07-03-2019 07:44:22","Latitude":"40.7489","Longitude":"-73.9849"}]
    //res.json(resp);
    // res.send('Hello World');
});


app.get('/speedgraph/engineTemperature/:id', async function(req, res) {
    const vid = req.params.id;
    const results = await engineTemperature(vid);
    console.log(results);
    res.json(results);
});


app.get('/speedgraph/engineRPM/:id', async function(req, res) {
    const vid = req.params.id;
    const results = await engineRPM(vid);
    console.log(results);
    res.json(results);
});


app.get('/speedgraph/engineLoad/:id', async function(req, res) {
    const vid = req.params.id;
    const results = await engineLoad(vid);
    console.log(results);
    res.json(results);
});


app.get('/speedgraph/coolantTemperature/:id', async function(req, res) {
    const vid = req.params.id;
    const results = await coolantTemperature(vid);
    console.log(results);
    res.json(results);
});


async function engineTemperature(vid) {
    const url = `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.uri}`;
    const client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).catch((err) => {
        console.log("could not connect to db");
    });
    console.log("db connected");
    try {
        const data = await client.db(config.mongodb.dbname).collection("metrics").find({ vehicleId: vid }).project({ timestamp: 1, engineTemperature: 1, _id: 0 }).sort({ timestamp: -1 }).limit(100).toArray(); //engineTemperature
        console.log(data);
        return data;
    } catch (e) {
        console.log(e);
    } finally {
        client.close();
    }
};


async function engineRPM(vid) {
    const url = `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.uri}`;
    const client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).catch((err) => {
        console.log("could not connect to db");
    });
    console.log("db connected");
    try {
        const data = await client.db(config.mongodb.dbname).collection("metrics").find({ vehicleId: vid }).project({ timestamp: 1, engineRPM: 1, _id: 0 }).sort({ timestamp: -1 }).limit(100).toArray(); //engineRPM
        console.log(data);
        return data;
    } catch (e) {
        console.log(e);
    } finally {
        client.close();
    }
};


async function engineLoad(vid) {
    const url = `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.uri}`;
    const client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).catch((err) => {
        console.log("could not connect to db");
    });
    console.log("db connected");
    try {
        const data = await client.db(config.mongodb.dbname).collection("metrics").find({ vehicleId: vid }).project({ timestamp: 1, engineLoad: 1, _id: 0 }).sort({ timestamp: -1 }).limit(100).toArray(); //engineLoad
        console.log(data);
        return data;
    } catch (e) {
        console.log(e);
    } finally {
        client.close();
    }
};


async function coolantTemperature(vid) {
    const url = `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.uri}`;
    const client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).catch((err) => {
        console.log("could not connect to db");
    });
    console.log("db connected");
    try {
        const data = await client.db(config.mongodb.dbname).collection("metrics").find({ vehicleId: vid }).project({ timestamp: 1, coolantTemperature: 1, _id: 0 }).sort({ timestamp: -1 }).limit(100).toArray(); //coolantTemperature
        console.log(data);
        return data;
    } catch (e) {
        console.log(e);
    } finally {
        client.close();
    }
};


async function queryContainer(vid) {
    const url = `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.uri}`;
    const client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).catch((err) => {
        console.log("could not connect to db");
    });
    try {
        const data = await client.db(config.mongodb.dbname).collection("metrics").find({ vehicleId: vid }).project({ latMatched: 1, lonMatched: 1, _id: 0 }).sort({ timestamp: -1 }).limit(1).toArray(); //queryContainer
        console.log(data);
        return data;
    } catch (e) {
        console.log(e);
    } finally {
        client.close();
    }
};

async function queryContainerforVid() {
    const url = `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.uri}`;
    const client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).catch((err) => {
        console.log("could not connect to db");
    });
    console.log("db connected");
    try {
        const data = await client.db(config.mongodb.dbname).collection("metrics").distinct("vehicleId"); //queryContainerforVid
        console.log(data);
        return data;
    } catch (e) {
        console.log(e);
    } finally {
        client.close();
    }
};


async function queryContainerforLatLong() {
    const url = `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.uri}`;
    const client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).catch((err) => {
        console.log("could not connect to db");
    });
    console.log("db connected");
    try {
        const data = await client.db(config.mongodb.dbname).collection("metrics").find({}).project({ latMatched: 1, lonMatched: 1, _id: 0 }).sort({ timestamp: -1 }).limit(1).toArray(); // queryContainerforLatLong
        console.log(data);
        return data;
    } catch (e) {
        console.log(e);
    } finally {
        client.close();
    }
};

app.listen(port);
console.log('Server Listening at port' + port);

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