const { Kafka, Partitioners } = require('kafkajs');
const config = require("./config.json")
const MongoClient = require("mongodb").MongoClient;


const kafka = new Kafka({
    clientId: config.kafka.clientId,
    brokers: config.kafka.brokers,
})

const consumer = kafka.consumer({ groupId: 'here' });

async function insertInMongo(data) {
    const url = `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.uri}`;
    const client = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).catch((err) => {
        console.log("could not connect to db");
    });
    console.log("db connected");
    try {
        await client.db(config.mongodb.dbname).collection("metrics").insertOne(data);
        console.log("inserted 1 record");
    } catch (e) {
        console.log(e.codeName);
    } finally {
        client.close();
    }
}


async function consume() {
    await consumer.connect();
    await consumer.subscribe({ topic: "here", fromBeginning: false });
    await consumer.run({
        eachMessage: async({ topic, partition, message }) => {
            try {
                console.log("data found");
                const { body } = JSON.parse(message.value.toString());
                await insertInMongo(body);
            } catch (e) {
                console.log("some error happened");
            }

        }
    })
}

consume();