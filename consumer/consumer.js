const Kafka = require('node-rdkafka');
const fs = require('fs');
const MongoClient = require("mongodb").MongoClient;

let config = null;

(() => {
    try {
        config = JSON.parse(fs.readFileSync('config.json'));
    } catch (err) {
        if (err.code == "ENOENT") {
            console.log("config file not found");
        }
    }
})();



const consumerConfig = {
    'metadata.broker.list': 'localhost:9092,localhost:9093,localhost:9094',
    'group.id': 'node-rdkafka-consumer-flow-example',
    'enable.auto.commit': false
}

const consumer = new Kafka.KafkaConsumer(consumerConfig);

async function insertInMongo(data) {

    const url = `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.uri}`;
    const client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).catch((err) => {
        console.log("could not connect to db");
    });
    try {
        await client.db(config.mongodb.dbname).collection("metrics").insertOne(data);
    } catch (e) {
        console.log("some error happened");
        console.log(e.codeName);
    } finally {
        client.close();
    }
}

consumer.on("ready", () => {
    console.log("consumer connected");
    const topic = "newtopic";
    consumer.subscribe([topic]);
    consumer.consume();
});

consumer.on('event.log', function(log) {
    console.log(log);
});

//logging all errors
consumer.on('event.error', function(err) {
    console.error('Error from consumer');
    console.error(err);
});

counter = 0;
numMessages = 10;

consumer.on('data', async(m) => {
    counter++;

    //committing offsets every numMessages
    if (counter % numMessages === 0) {
        consumer.commit(m);
    }

    try {
        const { body } = JSON.parse(m.value.toString());
        console.log(`telemetry received: ${body.vehicleId},${body.latMatched},${body.lonMatched},${body.engineTemperature},${body.engineRPM},${body.engineLoad},${body.coolantTemperature}`)
        await insertInMongo(body);
    } catch (e) {
        console.log("some error happened");
    }

});

consumer.connect();

setInterval(() => {}, 1000 * 60 * 60); // hour tick to stop the program from exiting