const { MongoClient, ServerApiVersion } = require('mongodb');
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

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const DB = client.db("TimeSeries");

        const lampen = DB.collection("lamps");
        const sensors = DB.collection("sensors");
        const elictricity = DB.collection("Wall Pluggs");

        const DeviceNameSensor = "Sensor Slaapkamer";
        const timeStamp1 = new Date();
        //const ISODate = new Date('2014-01-22T14:56:59.301Z');
        const Temperature = getRandomInt(150);
        const Humidity = getRandomInt(100);
        const DocSensor = makeDocSensor(DeviceNameSensor, timeStamp1, Temperature, Humidity);

        sleep(5000); //wait 5 seconds 

        const timeStamp2 = new Date();
        const DeviceNameLamp = "Lamp Living"
        const LightPercent = getRandomInt(100);
        const color = "Blue";
        const DocLamp = makeDocLamp(DeviceNameLamp, timeStamp2, LightPercent, color);

        sleep(5000); //wait 5 seconds 

        const timeStamp3 = new Date();
        const DeviceName = "PC";
        const On = true;
        const Watt = getRandomInt(1000);
        const DocPlugg = makeDocPlugg(DeviceName, timeStamp3, On, Watt);

        sensors.insertOne(DocSensor);
        lampen.insertOne(DocLamp);
        elictricity.insertOne(DocPlugg);

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);
