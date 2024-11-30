const { MongoClient, ServerApiVersion } = require('mongodb');
const { Collection } = require('mongoose');
var Benchmark = require('benchmark');
const suite = new Benchmark.Suite("Insert test");
const uri = "mongodb://localhost:27017/";
const fs = require('fs');
let DB = null;

//let DB = null; //client.db("TimeSeries");
//let lampen = null; //await DB.collection("lamps");
let sensors = null; //await DB.collection("sensors");
let elictricity = null; //await DB.collection("Wall Pluggs");

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
    if (amount > 0) {
        for (let i = 0; i < amount; i++) {
            const timeStamp = randomTimestamp();
            const DocLamp = makeLightElm(timeStamp);
            elements.push(DocLamp);
        }
        db.insertMany(elements);
    }

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

    if (amount > 0) {
        for (let i = 0; i < amount; i++) {
            const timeStamp = randomTimestamp();
            const DocSensor = makeSensorElm(timeStamp);
            elements.push(DocSensor);
        }
        db.insertMany(elements);
    }

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

    if (amount > 0) {

        for (let i = 0; i < amount; i++) {
            const timeStamp = randomTimestamp();
            const DocPlugg = makeElecElm(timeStamp);
            elements.push(DocPlugg);
        }
        db.insertMany(elements);
    }

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
            const time = currentTime - startTime;
            console.log("time running: " + time);
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

        //lampen.find()

        //populateDatabaseLights(1000, lampen);
        //populateDatabaseElectricity(1000, elictricity);
        //populateDatabaseSensor(1000, sensors);
        const startTime = new Date();
        const stopTime = addhours(24);

        //await populateDatabases(lampen, sensors, elictricity);
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

//run().catch(console.dir);
async function fetchDataLampName(lampen) {
    const lamp = getRandomInt(100);
    const DeviceNameLamp = "Lamp " + lamp.toString();
    const results = await lampen.find({ deviceName: DeviceNameLamp }).toArray();
    return results;
}

// TODO: populate database to fit x amount data 
// use that data for the benchmarks 

suite.on('start', async function () {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    sleep(2);
    DB = await client.db("TimeSeries");
    lampen = await DB.collection("lamps");
    sensors = await DB.collection("sensors");
    elictricity = await DB.collection("Wall Pluggs");
    fillTo(20000);
})

//fill till 20000 records
async function fillTo(amount) {
    const lampen = await DB.collection("lamps");
    const sensors = await DB.collection("sensors");
    const elictricity = await DB.collection("Wall Pluggs");

    const countLampen = await lampen.countDocuments();
    const countSensors = await sensors.countDocuments();
    const countElec = await elictricity.countDocuments();

    const toFillLampen = amount - countLampen;
    const toFillSensors = amount - countSensors;
    const toFillElec = amount - countElec;

    console.log(toFillLampen);

    await populateDatabaseElectricity(toFillElec, elictricity);
    await populateDatabaseLights(toFillLampen, lampen);
    await populateDatabaseSensor(toFillSensors, sensors);

}

//setup benchmarks 
suite
    //fill database to 20000 records first 
    .add("fetch all lights of same id (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            try {
                const lampen = await DB.collection("lamps");
                if (lampen != null) {
                    const results = await fetchDataLampName(lampen);
                    //console.log(`Fetched ${results.length} records.`);
                    deferred.resolve();
                } else {
                    console.error("Error during fetch: the light are not inisiated!");
                    deferred.resolve();
                }

            } catch (error) {
                console.error('Error during fetch:', error);
                deferred.resolve(); // Ensure deferred completion even on error
            }
        }
        //TODO: fetch data
    })
    // Log benchmark results
    .on('cycle', function (event) {
        console.log(String(event.target)); // Logs details of each benchmark
    })
    .on('complete', function () {
        console.log('All benchmarks completed.');

        this.forEach(benchmark => {
            //TODO: write to csv 
            console.log(`Benchmark: ${benchmark.name}`);
            console.log(`- Mean time: ${benchmark.stats.mean * 1000} ms`);
            console.log(`- Runs: ${benchmark.stats.sample.length}`);
            console.log(`- Total time: ${(benchmark.stats.sample.length * benchmark.stats.mean * 1000).toFixed(2)} ms`);
        });

        client.close().then(() => console.log('Database disconnected.'));
    })
    .run({ async: true });
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
