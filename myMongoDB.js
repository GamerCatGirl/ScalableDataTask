const { MongoClient, ServerApiVersion } = require('mongodb');
const { Collection } = require('mongoose');
const uri = "mongodb://localhost:27017/";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

function makeDocLamp(name, time, percent, color) {
    return doc = { deviceName: name, timeStamp: time, lightPercent: percent, color: color };
}

function makeDocSensor(name, time, temperature, humidity) {
    return doc = { deviceName: name, timeStamp: time, temperature: temperature, humidity: humidity };
}

function makeDocPlugg(name, time, status, watt) {
    return doc = { deviceName: name, timeStamp: time, status: status, watt: watt };
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomTimestamp() {
    return new Date(new Date() - Math.random() * (1e+12))
}

// TODO: add 1 million data to the database 
function populateDatabaseLights(amount, db) {
    const elements = new Array();

    for (let i = 0; i < amount; i++) {
        const timeStamp = randomTimestamp();
        const r = getRandomInt(255);
        const g = getRandomInt(255);
        const b = getRandomInt(255);
        const lamp = getRandomInt(100);
        const DeviceNameLamp = "Lamp " + lamp.toString();
        const LightPercent = getRandomInt(100);
        const color = "rgb( " + r + ", " + g + ", " + b + ")";
        const DocLamp = makeDocLamp(DeviceNameLamp, timeStamp, LightPercent, color);
        elements.push(DocLamp);
    }
    db.insertMany(elements);

}

function populateDatabaseSensor(amount, db) {
    const elements = new Array();

    for (let i = 0; i < amount; i++) {
        const timeStamp = randomTimestamp();
        const lamp = getRandomInt(100);
        const DeviceNameSensor = "Sensor " + lamp.toString();
        const Temperature = getRandomInt(150);
        const Humidity = getRandomInt(100);
        const DocSensor = makeDocSensor(DeviceNameSensor, timeStamp, Temperature, Humidity);
        elements.push(DocSensor);
    }
    db.insertMany(elements);

}

function randomBoolean() {
    const number = getRandomInt(2);
    if (number == 1) {
        return true;
    } else {
        return false;
    }
}

function populateDatabaseElectricity(amount, db) {
    const elements = new Array();

    for (let i = 0; i < amount; i++) {
        const timeStamp = randomTimestamp();
        const plugg = getRandomInt(100);
        const DeviceNameSensor = "Plugg " + plugg.toString();
        const On = randomBoolean();
        const Watt = getRandomInt(1000);
        const DocPlugg = makeDocPlugg(DeviceNameSensor, timeStamp, On, Watt);
        elements.push(DocPlugg);
    }
    db.insertMany(elements);

}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const DB = client.db("TimeSeries");

        const lampen = DB.collection("lamps");
        const sensors = DB.collection("sensors");
        const elictricity = DB.collection("Wall Pluggs");

        //populateDatabaseLights(1000, lampen);
        //populateDatabaseElectricity(1000, elictricity);
        //populateDatabaseSensor(1000, sensors);


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

//setup benchmarks 

// TODO: vary the intervals where new data will be written 
// [1s, 5s, 10s, 30s, 60s, 90s]

// TODO: refresh the view by reading the latest value (morst recent timestamp) every 
// [1s, 5s, 10s, 30s, 60s, 90s]

// TODO: find some database queries that are more difficult to execute 
