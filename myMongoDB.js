const { MongoClient, ServerApiVersion } = require('mongodb');
const { Collection } = require('mongoose');
var Benchmark = require('benchmark');
const suite = new Benchmark.Suite("Insert test");
const uri = "mongodb://localhost:27017/";
const fs = require('fs');

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

function makeLightElm(timeStamp) {
    const r = getRandomInt(255);
    const g = getRandomInt(255);
    const b = getRandomInt(255);
    const lamp = getRandomInt(100);
    const DeviceNameLamp = "Lamp " + lamp.toString();
    const LightPercent = getRandomInt(100);
    const color = "rgb( " + r + ", " + g + ", " + b + ")";
    const DocLamp = makeDocLamp(DeviceNameLamp, timeStamp, LightPercent, color);
    return DocLamp;
}


function populateDatabaseLights(amount, db) {
    const elements = new Array();

    for (let i = 0; i < amount; i++) {
        const timeStamp = randomTimestamp();
        const DocLamp = makeLightElm(timeStamp);
        elements.push(DocLamp);
    }
    db.insertMany(elements);

}

function makeSensorElm(timeStamp) {
    const lamp = getRandomInt(100);
    const DeviceNameSensor = "Sensor " + lamp.toString();
    const Temperature = getRandomInt(150);
    const Humidity = getRandomInt(100);
    const DocSensor = makeDocSensor(DeviceNameSensor, timeStamp, Temperature, Humidity);
    return DocSensor;
}

function populateDatabaseSensor(amount, db) {
    const elements = new Array();

    for (let i = 0; i < amount; i++) {
        const timeStamp = randomTimestamp();
        const DocSensor = makeSensorElm(timeStamp);
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

function makeElecElm(timeStamp) {
    const plugg = getRandomInt(100);
    const DeviceNameSensor = "Plugg " + plugg.toString();
    const On = randomBoolean();
    const Watt = getRandomInt(1000);
    const DocPlugg = makeDocPlugg(DeviceNameSensor, timeStamp, On, Watt);
    return DocPlugg;
}

function populateDatabaseElectricity(amount, db) {
    const elements = new Array();

    for (let i = 0; i < amount; i++) {
        const timeStamp = randomTimestamp();
        const DocPlugg = makeElecElm(timeStamp);
        elements.push(DocPlugg);
    }
    db.insertMany(elements);

}

// taken from https://javascript.plainenglish.io/javascript-add-hours-to-date-6e3a39bb9345
function addhours(hours) {
    const date = new Date();
    const hoursToAdd = hours * 60 * 60 * 1000;
    date.setTime(date.getTime() + hoursToAdd);
    return date;
}

async function insertInto(elm, db) {
    await db.insertOne(elm)
    console.log(elm);
}

async function loop(dbLamp, dbSensor, dbElec, startTime, currentTime, stopTime) {
    if (currentTime < stopTime) {
        //1. add data 
        const docLamp = makeLightElm(currentTime);
        await insertInto(docLamp, dbLamp);
        const docSensor = makeSensorElm(currentTime);
        await insertInto(docSensor, dbSensor);
        const docElec = makeElecElm(currentTime);
        await insertInto(docElec, dbElec);
        //2. sleep 5seconds 
        console.log("start sleeping...")
        setTimeout(() => {
            //3set currentTime
            console.log("sleep done");
            newTime = new Date();
            loop(dbLamp, dbSensor, dbElec, startTime, newTime, stopTime);
            return "done"
        }, 5000);
    } else {
        await client.close();
        console.log(startTime);
        console.log(stopTime);
    }
}

async function populateDatabases(dbLamp, dbSensor, dbElec) {
    const startTime = new Date();
    const stopTime = addhours(24);

    let currentTime = startTime;

    const done = await loop(dbLamp, dbSensor, dbElec, startTime, currentTime, stopTime)
    return done;
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        // Send a ping to confirm a successful connection
        const DB = client.db("TimeSeries");

        const lampen = await DB.collection("lamps");
        const sensors = await DB.collection("sensors");
        const elictricity = await DB.collection("Wall Pluggs");

        sleep(200);

        //populateDatabaseLights(1000, lampen);
        //populateDatabaseElectricity(1000, elictricity);
        //populateDatabaseSensor(1000, sensors);
        const startTime = new Date();
        const stopTime = addhours(24);

        await populateDatabases(lampen, sensors, elictricity);
        //console.log(done);


    } finally {
        const data = startTime.toString() + "\n" + stopTime.toString();
        fs.writeFile('dateMongoDB.txt', data, (err) => {
            if (err) throw err;
        })

    }
}
/*finally {
    // Ensures that the client will close when you finish/error
    await client.close();
}
    */

run().catch(console.dir);

// TODO: let code run 24 hours to populate database 
// TODO: populate database to fit x amount data 
// use that data for the benchmarks 

//setup benchmarks 
/*
suite
    .add("write data to database", function () {
        //TODO: write data to database
    })
    .add("fetch all data of same id", function () {
        //TODO: fetch data
    })
    .add("get latest data (last 1h)", function () {
        //TODO: fetch latest data
    })
    .on('complete', function () {
        //TODO: print the results
    })
*/

// TODO: find some database queries that are more difficult to execute 
