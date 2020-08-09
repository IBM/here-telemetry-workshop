const Kafka = require('node-rdkafka');
const fs = require('fs');
const MongoClient = require("mongodb").MongoClient;

let config = {};

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
    'metadata.broker.list': process.env.KAFKA_BROKERS || config.kafkaBrokers || 'localhost:9092,localhost:9093,localhost:9094',
    'group.id': process.env.KAFKA_CONSUMER_GROUP_ID || config.kafkaGroupID || 'here-consumer-group',
    'enable.auto.commit': false
}

const consumer = new Kafka.KafkaConsumer(consumerConfig);

async function insertInMongo(data) {
    const url = process.env.MONGO_CONNECTION_URL || config.mongoConnectionURL || "mongodb://admin:admin@localhost:27017"

    const clientSettings = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
    // if mongo db has database cert
    if (process.env.DATABASE_CERT) {
        fs.writeFileSync("./cert.pem", process.env.DATABASE_CERT);
        clientSettings.tls = true;
        clientSettings.tlsCAFile = "./cert.pem";
    }

    const client = await MongoClient.connect(url, clientSettings).catch((err) => {
        console.log("could not connect to db");
    });

    if (!client) {
        return;
    }

    const dbname = process.env.MONGODB_NAME || config.mongodbName || "here";

    try {
        await client.db(dbname).collection("metrics").insertOne(data);
    } catch (e) {
        console.log("some error happened");
        console.log(e.codeName);
    } finally {
        client.close();
    }
}

consumer.on("ready", () => {
    console.log("consumer connected");
    const topic = "metrics";
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

let counter = 0;
const numMessages = 10;

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