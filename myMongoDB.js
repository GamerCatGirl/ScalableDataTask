const { MongoClient, ServerApiVersion } = require('mongodb');
const { Collection } = require('mongoose');
var Benchmark = require('benchmark');
const suite = new Benchmark.Suite("Insert test");
const uri = "mongodb://localhost:27017/";
let printed = false;
const fs = require('fs');
let DB = null;

//TO check what is added to delete short after the test 
let amountAddedLampen = 0;
let amountAddedElec = 0;
let amountAddedSensor = 0;
let toDelete = 103633;
let sizeCollection = 20000;

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

function makeRGB() {
    const r = getRandomInt(255);
    const g = getRandomInt(255);
    const b = getRandomInt(255);
    const color = "rgb( " + r + ", " + g + ", " + b + ")";
    return color;
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
            amountAddedLampen += 1;
        }
        db.insertMany(elements);
    }

}

async function populateDatabaseLightsAddOne(amount, db) {
    if (amount > 0) {
        for (let i = 0; i < amount; i++) {
            const timeStamp = randomTimestamp();
            const DocLamp = makeLightElm(timeStamp);
            amountAddedLampen += 1;
            await db.insertOne(DocLamp);
        }
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
            amountAddedSensor += 1;
            elements.push(DocSensor);
        }
        db.insertMany(elements);
    }

}

async function populateDatabaseSensorAddOne(amount, db) {
    if (amount > 0) {
        for (let i = 0; i < amount; i++) {
            const timeStamp = randomTimestamp();
            const DocSensor = makeSensorElm(timeStamp);
            amountAddedSensor += 1
            await db.insertOne(DocSensor);
        }
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
            amountAddedElec += 1
        }
        db.insertMany(elements);
    }
}

async function populateDatabaseElectricityAddOne(amount, db) {

    if (amount > 0) {

        for (let i = 0; i < amount; i++) {
            const timeStamp = randomTimestamp();
            const DocPlugg = makeElecElm(timeStamp);
            amountAddedElec += 1
            await db.insertOne(DocPlugg);
        }
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

async function findLast(collection, time) {
    // Step 1: Get the most recent document
    const mostRecentDoc = await collection.findOne({}, { sort: { timeStamp: -1 } });

    if (!mostRecentDoc) {
        console.log('No data found.');
        return [];
    }

    const mostRecentTimestamp = mostRecentDoc.timeStamp;

    // Step 2: Define the range (1 minute after the most recent timestamp)
    const oneMinuteEarlier = new Date(mostRecentTimestamp);
    oneMinuteEarlier.setMinutes(oneMinuteEarlier.getMinutes() - time);

    // Step 3: Query all documents in the range
    const query = {
        timeStamp: {
            $gte: oneMinuteEarlier, // Include the most recent timestamp
            $lt: mostRecentTimestamp        // Exclude anything beyond one minute
        }
    };

    const result = await collection.find(query).toArray();
    return result;
};
/*finally {
    // Ensures that the client will close when you finish/error
    await client.close();
}
    */

//run().catch(console.dir);

async function fetchDataPluggsName(sensors) {
    const sensor = getRandomInt(100);
    const DeviceNamePlugg = "Plugg " + sensor.toString();
    const results = await sensors.find({ deviceName: DeviceNamePlugg }).toArray();
    return results;
}

async function fetchDataSensorName(sensors) {
    const sensor = getRandomInt(100);
    const DeviceNameLamp = "Sensor " + sensor.toString();
    const results = await sensors.find({ deviceName: DeviceNameLamp }).toArray();
    return results;
}

async function fetchDataLampName(lampen) {
    const lamp = getRandomInt(100);
    const DeviceNameLamp = "Lamp " + lamp.toString();
    const results = await lampen.find({ deviceName: DeviceNameLamp }).toArray();
    return results;
}

async function deleteBefore(db, amount) {
    const cutoffDate = new Date('2024-11-25T00:00:00Z');
    const filter = { timeStamp: { $lt: cutoffDate } };

    for (let i = 0; i < amount; i++) {
        await db.deleteOne(filter);
    }
}

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

    if (!printed) {
        console.log(toFillLampen);
        console.log(toFillSensors);
        console.log(toFillElec);
        printed = true;
    }

    await populateDatabaseElectricity(toFillElec, elictricity);
    await populateDatabaseLights(toFillLampen, lampen);
    await populateDatabaseSensor(toFillSensors, sensors);

}

suite
    .on('start', async function () {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        sleep(2);
        DB = await client.db("TimeSeries");
        lampen = await DB.collection("lamps");
        sensors = await DB.collection("sensors");
        elictricity = await DB.collection("Wall Pluggs");
    })

    .add("deleting and filling database to wanted amount", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await deleteBefore(lampen, toDelete);
            toDelete = 0;

            await fillTo(sizeCollection);
            deferred.resolve();
        }
    })

    //setup benchmarks 
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
    })
    .add("fetch all sensors of same id (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            try {
                const sensors = await DB.collection("sensors");
                if (sensors != null) {
                    const results = await fetchDataSensorName(sensors);
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
    })
    .add("fetch all elec of same id (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            try {
                const pluggs = await DB.collection("Wall Pluggs");
                if (pluggs != null) {
                    const results = await fetchDataPluggsName(pluggs);
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
    })

    //fetch most resent data for certain id (for all) 
    .add("fetch all most recent of same id (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const id = getRandomInt(100);
            const DeviceNamePlugg = "Plugg " + id.toString();
            const DeviceNameLamp = "Lamp " + id.toString();
            const DeviceNameSensor = "Sensor " + id.toString();

            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");

            //most recent 
            const queryLamp = { deviceName: DeviceNameLamp };
            await lampen.findOne(queryLamp, { sort: { timeStamp: -1 } });

            const queryPlugg = { deviceName: DeviceNamePlugg };
            await elictricity.findOne(queryPlugg, { sort: { timeStamp: -1 } });

            const querySensor = { deviceName: DeviceNameSensor };
            await sensors.findOne(querySensor, { sort: { timeStamp: -1 } });

            deferred.resolve();

        }
    })

    // fetch all data for the last minute 
    .add("fetch all last minute -- lamp (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await findLast(lampen, 1);

            deferred.resolve();
        }
    })

    .add("fetch all last minute -- sensor (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const sensors = await DB.collection("sensors");
            await findLast(sensors, 1);
            deferred.resolve();
        }
    })

    .add("fetch all last minute -- pluggs (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const elictricity = await DB.collection("Wall Pluggs");
            await findLast(elictricity, 1);
            deferred.resolve();
        }
    })

    //fetch all data for the last 10 minute 
    .add("fetch all last 10 minutes -- lamp (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await findLast(lampen, 10);
            deferred.resolve();
        }
    })

    .add("fetch all last 10 minutes -- sensor (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const sensors = await DB.collection("sensors");
            await findLast(sensors, 10);
            deferred.resolve();
        }
    })

    .add("fetch all last 10 minutes -- pluggs (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const elictricity = await DB.collection("Wall Pluggs");
            await findLast(elictricity, 10);
            deferred.resolve();
        }
    })

    //fetch all data for the last 15 min 
    .add("fetch all last 15 minutes -- lamp (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await findLast(lampen, 15);
            deferred.resolve();
        }
    })

    //fetch all data for the last 30 min 
    .add("fetch all last 30 minutes -- lamp (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await findLast(lampen, 30);
            deferred.resolve();
        }
    })

    //fetch all data for the last hour 
    .add("fetch all last hour -- lamp (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await findLast(lampen, 60);
            deferred.resolve();
        }
    })

    .add("fetch all last hour -- sensor (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const sensors = await DB.collection("sensors");
            await findLast(sensors, 60);
            deferred.resolve();
        }
    })

    .add("fetch all last hour -- pluggs (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const elictricity = await DB.collection("Wall Pluggs");
            await findLast(elictricity, 10);
            deferred.resolve();
        }
    })

    // fetch all data for the last 2 hour 
    .add("fetch all last 2 hours -- lamp (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await findLast(lampen, 60);
            deferred.resolve();
        }
    })

    // fetch all data for the last 5 hour 
    .add("fetch all last 5 hours -- lamp (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await findLast(lampen, 300);
            deferred.resolve();
        }
    })

    // fetch all data for the last 12 hour 
    .add("fetch all last 12 hours -- lamp (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await findLast(lampen, 720);
            deferred.resolve();
        }
    })

    .add("fetch all last 12 hours -- sensor (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const sensors = await DB.collection("sensors");
            await findLast(sensors, 720);
            deferred.resolve();
        }
    })

    .add("fetch all last 12 hours -- pluggs (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const elictricity = await DB.collection("Wall Pluggs");
            await findLast(elictricity, 720);
            deferred.resolve();
        }
    })

    // fetch all data for the last 24 hour 
    .add("fetch all last 24 hours -- lamp (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await findLast(lampen, 1440);
            deferred.resolve();
        }
    })

    .add("fetch all last 24 hours -- sensor (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const sensors = await DB.collection("sensors");
            await findLast(sensors, 1440);
            deferred.resolve();
        }
    })

    .add("fetch all last 24 hours -- pluggs (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const elictricity = await DB.collection("Wall Pluggs");
            await findLast(elictricity, 1440);
            deferred.resolve();
        }
    })

    // fetch recent data for all with same name (same user)
    .add("fetch all last 30 minutes -- all (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await findLast(elictricity, 30);
            await findLast(sensors, 30);
            await findLast(lampen, 30);

            deferred.resolve();
        }
    })
    .add("fetch all last hour -- all (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await findLast(elictricity, 60);
            await findLast(sensors, 60);
            await findLast(lampen, 60);

            deferred.resolve();
        }
    })

    .add("fetch all last 2 hours -- all (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await findLast(elictricity, 120);
            await findLast(sensors, 120);
            await findLast(lampen, 120);

            deferred.resolve();

        }
    })

    .add("fetch all last 5 hours -- all (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {

            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await findLast(elictricity, 300);
            await findLast(sensors, 300);
            await findLast(lampen, 300);

            deferred.resolve();

        }
    })

    .add("fetch all last 12 hours -- all (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await findLast(elictricity, 720);
            await findLast(sensors, 720);
            await findLast(lampen, 720);

            deferred.resolve();
        }
    })

    .add("fetch all last 24 hours -- all (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await findLast(elictricity, 1440);
            await findLast(sensors, 1440);
            await findLast(lampen, 1440);

            deferred.resolve();
        }
    })

    // TODO: compare database sorted vs unsorted previous
    //update 
    //update 1 value in a row 
    .add("update 1 value in a row - lampen (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            // Query to find the document
            const lamp = getRandomInt(100);
            const DeviceNameLamp = "Lamp " + lamp.toString();
            const query = {
                deviceName: DeviceNameLamp,
            };
            // update lightpercent 
            const updateValue = getRandomInt(100);
            const update = {
                $set: { lightPercent: updateValue } // Replace 'updatedField' with your field name
            };

            // Perform the update
            await lampen.updateOne(query, update);

            deferred.resolve();
        }
    })

    //update 2 values in a row 
    .add("update 2 values in a row - lampen (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            // Query to find the document
            const lamp = getRandomInt(100);
            const DeviceNameLamp = "Lamp " + lamp.toString();
            const query = {
                deviceName: DeviceNameLamp,
            };
            // update lightpercent 
            const updateValue = getRandomInt(100);
            const colorUpdate = makeRGB();
            const update = {
                $set: {
                    lightPercent: updateValue,
                    color: colorUpdate
                } // Replace 'updatedField' with your field name
            };

            // Perform the update
            await lampen.updateOne(query, update);

            deferred.resolve();
        }
    })

    //update 3 values in a row 
    .add("update 3 values in a row - lampen (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            // Query to find the document
            const lamp = getRandomInt(100);
            const DeviceNameLamp = "Lamp " + lamp.toString();
            const query = {
                deviceName: DeviceNameLamp,
            };
            // update lightpercent 
            const updateValue = getRandomInt(100);
            const newId = getRandomInt(100);
            const colorUpdate = makeRGB();
            const newName = "Lamp " + newId.toString();
            const update = {
                $set: {
                    lightPercent: updateValue,
                    color: colorUpdate,
                    deviceName: newName
                } // Replace 'updatedField' with your field name
            };

            // Perform the update
            await lampen.updateOne(query, update);

            deferred.resolve();
        }
    })

    //update multiple colums 
    // update 2 colums 
    .add("update 1 column - lampen (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            // Query to find the document
            const lamp = getRandomInt(100);
            const DeviceNameLamp = "Lamp " + lamp.toString();
            const query = {
                deviceName: DeviceNameLamp,
            };
            // update lightpercent 
            const updateValue = getRandomInt(100);
            const update = {
                $set: { lightPercent: updateValue } // Replace 'updatedField' with your field name
            };

            // Perform the update
            await lampen.updateOne(query, update);

            deferred.resolve();
        }
    })

    .add("update 2 columns - lampen (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            // Query to find the document
            const lamp = getRandomInt(100);
            const DeviceNameLamp = "Lamp " + lamp.toString();
            const lamp2 = getRandomInt(100);
            const DeviceNameLamp2 = "Lamp " + lamp2.toString();

            const query = {
                deviceName: DeviceNameLamp,
            };
            const query2 = {
                deviceName: DeviceNameLamp2
            }
            // update lightpercent 
            const updateValue = getRandomInt(100);
            const update = {
                $set: { lightPercent: updateValue } // Replace 'updatedField' with your field name
            };

            // Perform the update
            await lampen.updateOne(query, update);
            await lampen.updateOne(query2, update);

            deferred.resolve();
        }
    })
    .add("update 5 columns - lampen (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            // Query to find the document
            const lamp = getRandomInt(100);
            const DeviceNameLamp = "Lamp " + lamp.toString();
            const lamp2 = getRandomInt(100);
            const DeviceNameLamp2 = "Lamp " + lamp2.toString();
            const lamp3 = getRandomInt(100);
            const DeviceNameLamp3 = "Lamp " + lamp3.toString();
            const lamp4 = getRandomInt(100);
            const DeviceNameLamp4 = "Lamp " + lamp4.toString();
            const lamp5 = getRandomInt(100);
            const DeviceNameLamp5 = "Lamp " + lamp5.toString();

            const query = {
                deviceName: DeviceNameLamp,
            };
            const query2 = {
                deviceName: DeviceNameLamp2
            }
            const query3 = {
                deviceName: DeviceNameLamp3
            }
            const query4 = {
                deviceName: DeviceNameLamp4
            }
            const query5 = {
                deviceName: DeviceNameLamp5
            }
            // update lightpercent 
            const updateValue = getRandomInt(100);
            const update = {
                $set: { lightPercent: updateValue } // Replace 'updatedField' with your field name
            };

            // Perform the update
            await lampen.updateOne(query, update);
            await lampen.updateOne(query2, update);
            await lampen.updateOne(query3, update);
            await lampen.updateOne(query4, update);
            await lampen.updateOne(query5, update);

            deferred.resolve();
        }
    })

    .add("update 10 columns - lampen (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            // Query to find the document
            const lamp = getRandomInt(100);
            const DeviceNameLamp = "Lamp " + lamp.toString();
            const lamp2 = getRandomInt(100);
            const DeviceNameLamp2 = "Lamp " + lamp2.toString();
            const lamp3 = getRandomInt(100);
            const DeviceNameLamp3 = "Lamp " + lamp3.toString();
            const lamp4 = getRandomInt(100);
            const DeviceNameLamp4 = "Lamp " + lamp4.toString();
            const lamp5 = getRandomInt(100);
            const DeviceNameLamp5 = "Lamp " + lamp5.toString();
            const lamp6 = getRandomInt(100);
            const DeviceNameLamp6 = "Lamp " + lamp6.toString();
            const lamp7 = getRandomInt(100);
            const DeviceNameLamp7 = "Lamp " + lamp7.toString();
            const lamp8 = getRandomInt(100);
            const DeviceNameLamp8 = "Lamp " + lamp8.toString();
            const lamp9 = getRandomInt(100);
            const DeviceNameLamp9 = "Lamp " + lamp9.toString();
            const lamp10 = getRandomInt(100);
            const DeviceNameLamp10 = "Lamp " + lamp10.toString();

            const query = {
                deviceName: DeviceNameLamp,
            };
            const query2 = {
                deviceName: DeviceNameLamp2
            }
            const query3 = {
                deviceName: DeviceNameLamp3
            }
            const query4 = {
                deviceName: DeviceNameLamp4
            }
            const query5 = {
                deviceName: DeviceNameLamp5
            }
            const query6 = {
                deviceName: DeviceNameLamp6,
            };
            const query7 = {
                deviceName: DeviceNameLamp7
            }
            const query8 = {
                deviceName: DeviceNameLamp8
            }
            const query9 = {
                deviceName: DeviceNameLamp9
            }
            const query10 = {
                deviceName: DeviceNameLamp10
            }
            // update lightpercent 
            const updateValue = getRandomInt(100);
            const update = {
                $set: { lightPercent: updateValue } // Replace 'updatedField' with your field name
            };

            // Perform the update
            await lampen.updateOne(query, update);
            await lampen.updateOne(query2, update);
            await lampen.updateOne(query3, update);
            await lampen.updateOne(query4, update);
            await lampen.updateOne(query5, update);
            await lampen.updateOne(query6, update);
            await lampen.updateOne(query7, update);
            await lampen.updateOne(query8, update);
            await lampen.updateOne(query9, update);
            await lampen.updateOne(query10, update);

            deferred.resolve();
        }
    })
    .add("update 20 columns - lampen (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            // Query to find the document
            const lamp = getRandomInt(100);
            const DeviceNameLamp = "Lamp " + lamp.toString();
            const lamp2 = getRandomInt(100);
            const DeviceNameLamp2 = "Lamp " + lamp2.toString();
            const lamp3 = getRandomInt(100);
            const DeviceNameLamp3 = "Lamp " + lamp3.toString();
            const lamp4 = getRandomInt(100);
            const DeviceNameLamp4 = "Lamp " + lamp4.toString();
            const lamp5 = getRandomInt(100);
            const DeviceNameLamp5 = "Lamp " + lamp5.toString();
            const lamp6 = getRandomInt(100);
            const DeviceNameLamp6 = "Lamp " + lamp6.toString();
            const lamp7 = getRandomInt(100);
            const DeviceNameLamp7 = "Lamp " + lamp7.toString();
            const lamp8 = getRandomInt(100);
            const DeviceNameLamp8 = "Lamp " + lamp8.toString();
            const lamp9 = getRandomInt(100);
            const DeviceNameLamp9 = "Lamp " + lamp9.toString();
            const lamp10 = getRandomInt(100);
            const DeviceNameLamp10 = "Lamp " + lamp10.toString();
            const lamp11 = getRandomInt(100);
            const DeviceNameLamp11 = "Lamp " + lamp11.toString();
            const lamp12 = getRandomInt(100);
            const DeviceNameLamp12 = "Lamp " + lamp12.toString();
            const lamp13 = getRandomInt(100);
            const DeviceNameLamp13 = "Lamp " + lamp13.toString();
            const lamp14 = getRandomInt(100);
            const DeviceNameLamp14 = "Lamp " + lamp14.toString();
            const lamp15 = getRandomInt(100);
            const DeviceNameLamp15 = "Lamp " + lamp15.toString();
            const lamp16 = getRandomInt(100);
            const DeviceNameLamp16 = "Lamp " + lamp16.toString();
            const lamp17 = getRandomInt(100);
            const DeviceNameLamp17 = "Lamp " + lamp17.toString();
            const lamp18 = getRandomInt(100);
            const DeviceNameLamp18 = "Lamp " + lamp18.toString();
            const lamp19 = getRandomInt(100);
            const DeviceNameLamp19 = "Lamp " + lamp19.toString();
            const lamp20 = getRandomInt(100);
            const DeviceNameLamp20 = "Lamp " + lamp20.toString();

            const query = {
                deviceName: DeviceNameLamp,
            };
            const query2 = {
                deviceName: DeviceNameLamp2
            }
            const query3 = {
                deviceName: DeviceNameLamp3
            }
            const query4 = {
                deviceName: DeviceNameLamp4
            }
            const query5 = {
                deviceName: DeviceNameLamp5
            }
            const query6 = {
                deviceName: DeviceNameLamp6,
            };
            const query7 = {
                deviceName: DeviceNameLamp7
            }
            const query8 = {
                deviceName: DeviceNameLamp8
            }
            const query9 = {
                deviceName: DeviceNameLamp9
            }
            const query10 = {
                deviceName: DeviceNameLamp10
            }
            const query11 = {
                deviceName: DeviceNameLamp11,
            };
            const query12 = {
                deviceName: DeviceNameLamp12
            }
            const query13 = {
                deviceName: DeviceNameLamp13
            }
            const query14 = {
                deviceName: DeviceNameLamp14
            }
            const query15 = {
                deviceName: DeviceNameLamp15
            }
            const query16 = {
                deviceName: DeviceNameLamp16,
            };
            const query17 = {
                deviceName: DeviceNameLamp17
            }
            const query18 = {
                deviceName: DeviceNameLamp18
            }
            const query19 = {
                deviceName: DeviceNameLamp19
            }
            const query20 = {
                deviceName: DeviceNameLamp20
            }
            // update lightpercent 
            const updateValue = getRandomInt(100);
            const update = {
                $set: { lightPercent: updateValue } // Replace 'updatedField' with your field name
            };

            // Perform the update
            await lampen.updateOne(query, update);
            await lampen.updateOne(query2, update);
            await lampen.updateOne(query3, update);
            await lampen.updateOne(query4, update);
            await lampen.updateOne(query5, update);
            await lampen.updateOne(query6, update);
            await lampen.updateOne(query7, update);
            await lampen.updateOne(query8, update);
            await lampen.updateOne(query9, update);
            await lampen.updateOne(query10, update);
            await lampen.updateOne(query11, update);
            await lampen.updateOne(query12, update);
            await lampen.updateOne(query13, update);
            await lampen.updateOne(query14, update);
            await lampen.updateOne(query15, update);
            await lampen.updateOne(query16, update);
            await lampen.updateOne(query17, update);
            await lampen.updateOne(query18, update);
            await lampen.updateOne(query19, update);
            await lampen.updateOne(query20, update);

            deferred.resolve();
        }
    })

    // compare addAll/add one by one 
    .add("addOne write 1 (20000 records)", { //max +- 150 documents  
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLightsAddOne(1, lampen);

            let amountInDB = await lampen.countDocuments();
            console.log(amountInDB);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })

    .add("addOne write 10 (20000 records)", { //max +- 1500 docs
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLightsAddOne(10, lampen);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })
    .add("addOne write 100 (20000 records)", { //max +- 15K docs
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLightsAddOne(100, lampen);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })
    .add("addOne write 1K (20000 records)", { //max +- 150K docs 
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLightsAddOne(1000, lampen);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })
    //can be used for bigger db's 
    .add("addOne write 5K (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLightsAddOne(1, lampen);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })
    .add("addAll write 1 (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLights(1, lampen);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })
    .add("addAll write 10 (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLights(10, lampen);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })
    .add("addAll write 100 (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLights(100, lampen);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })
    .add("addAll write 1K (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLights(1000, lampen);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })
    .add("addAll write 5K (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLights(5000, lampen);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })

    .add("add 1 data in lamps (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLights(1, lampen);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })

    .add("add 1 data in sensor (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const sensors = await DB.collection("sensors");
            await populateDatabaseSensor(1, sensors);
            deferred.resolve();

        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            await deleteBefore(lampen, amountAddedLampen);
            await deleteBefore(sensors, amountAddedSensor);

            amountAddedLampen = 0;
            amountAddedSensor = 0;
            deferred.resolve();
        }
    })

    .add("add 1 data in pluggs (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {

            const elictricity = await DB.collection("Wall Pluggs");
            await populateDatabaseElectricity(1, elictricity);
            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await deleteBefore(lampen, amountAddedLampen);
            await deleteBefore(sensors, amountAddedSensor);
            await deleteBefore(elictricity, amountAddedElec);

            amountAddedLampen = 0;
            amountAddedSensor = 0;
            amountAddedElec = 0;
            deferred.resolve();
        }
    })
    .add("add 10 data in lamps (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLights(10, lampen);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })

    .add("add 10 data in sensor (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const sensors = await DB.collection("sensors");
            await populateDatabaseSensor(10, sensors);
            deferred.resolve();

        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            await deleteBefore(lampen, amountAddedLampen);
            await deleteBefore(sensors, amountAddedSensor);

            amountAddedLampen = 0;
            amountAddedSensor = 0;
            deferred.resolve();
        }
    })

    .add("add 10 data in pluggs (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {

            const elictricity = await DB.collection("Wall Pluggs");
            await populateDatabaseElectricity(10, elictricity);
            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await deleteBefore(lampen, amountAddedLampen);
            await deleteBefore(sensors, amountAddedSensor);
            await deleteBefore(elictricity, amountAddedElec);

            amountAddedLampen = 0;
            amountAddedSensor = 0;
            amountAddedElec = 0;
            deferred.resolve();
        }
    })
    .add("add 100 data in lamps (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLights(100, lampen);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })

    .add("add 100 data in sensor (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const sensors = await DB.collection("sensors");
            await populateDatabaseSensor(100, sensors);
            deferred.resolve();

        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            await deleteBefore(lampen, amountAddedLampen);
            await deleteBefore(sensors, amountAddedSensor);

            amountAddedLampen = 0;
            amountAddedSensor = 0;
            deferred.resolve();
        }
    })

    .add("add 100 data in pluggs (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {

            const elictricity = await DB.collection("Wall Pluggs");
            await populateDatabaseElectricity(100, elictricity);
            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await deleteBefore(lampen, amountAddedLampen);
            await deleteBefore(sensors, amountAddedSensor);
            await deleteBefore(elictricity, amountAddedElec);

            amountAddedLampen = 0;
            amountAddedSensor = 0;
            amountAddedElec = 0;
            deferred.resolve();
        }
    })
    .add("add 1000 data in lamps (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await populateDatabaseLights(1000, lampen);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            await deleteBefore(lampen, amountAddedLampen);

            amountAddedLampen = 0;
            deferred.resolve();
        }
    })

    .add("add 1000 data in sensor (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        maxTime: 10,
        fn: async function (deferred) {
            const sensors = await DB.collection("sensors");
            await populateDatabaseSensor(1000, sensors);
            deferred.resolve();

        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            await deleteBefore(lampen, amountAddedLampen);
            await deleteBefore(sensors, amountAddedSensor);

            amountAddedLampen = 0;
            amountAddedSensor = 0;
            deferred.resolve();
        }
    })

    .add("add 1000 data in pluggs (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {

            const elictricity = await DB.collection("Wall Pluggs");
            await populateDatabaseElectricity(1000, elictricity);
            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await deleteBefore(lampen, amountAddedLampen);
            await deleteBefore(sensors, amountAddedSensor);
            await deleteBefore(elictricity, amountAddedElec);

            amountAddedLampen = 0;
            amountAddedSensor = 0;
            amountAddedElec = 0;
            deferred.resolve();
        }
    })




    .add("add 1 data in all (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");

            await populateDatabaseLights(1, lampen);
            await populateDatabaseElectricity(1, elictricity);
            await populateDatabaseSensor(1, sensors);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await deleteBefore(lampen, amountAddedLampen);
            await deleteBefore(sensors, amountAddedSensor);
            await deleteBefore(elictricity, amountAddedElec);

            amountAddedLampen = 0;
            amountAddedSensor = 0;
            amountAddedElec = 0;
            deferred.resolve();
        }
    })

    .add("add 10 data in all (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");

            await populateDatabaseLights(10, lampen);
            await populateDatabaseElectricity(10, elictricity);
            await populateDatabaseSensor(10, sensors);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await deleteBefore(lampen, amountAddedLampen);
            await deleteBefore(sensors, amountAddedSensor);
            await deleteBefore(elictricity, amountAddedElec);

            amountAddedLampen = 0;
            amountAddedSensor = 0;
            amountAddedElec = 0;
            deferred.resolve();
        }
    })

    .add("add 100 data in all (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");

            await populateDatabaseLights(100, lampen);
            await populateDatabaseElectricity(100, elictricity);
            await populateDatabaseSensor(100, sensors);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await deleteBefore(lampen, amountAddedLampen);
            await deleteBefore(sensors, amountAddedSensor);
            await deleteBefore(elictricity, amountAddedElec);

            amountAddedLampen = 0;
            amountAddedSensor = 0;
            amountAddedElec = 0;
            deferred.resolve();
        }
    })


    .add("add 1K data in all (20000 records)", {
        defer: true, //allows async operations
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");

            await populateDatabaseLights(1000, lampen);
            await populateDatabaseElectricity(1000, elictricity);
            await populateDatabaseSensor(1000, sensors);

            deferred.resolve();
        }
    })
    .add("Test deleted?", {
        defer: true,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");
            const sensors = await DB.collection("sensors");
            const elictricity = await DB.collection("Wall Pluggs");
            await deleteBefore(lampen, amountAddedLampen);
            await deleteBefore(sensors, amountAddedSensor);
            await deleteBefore(elictricity, amountAddedElec);

            amountAddedLampen = 0;
            amountAddedSensor = 0;
            amountAddedElec = 0;
            deferred.resolve();
        }
    })
    .add("delete 1 record lampen", {
        defer: true,
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await deleteBefore(lampen, 1);

            deferred.resolve();
        }
    })
    .add("Test added", {
        defer: true,
        fn: async function (deferred) {

            await fillTo(sizeCollection);

            deferred.resolve();
        }
    })
    .add("delete 10 record lampen", {
        defer: true,
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await deleteBefore(lampen, 10);

            deferred.resolve();
        }
    })
    .add("Test added", {
        defer: true,
        fn: async function (deferred) {

            await fillTo(sizeCollection);

            deferred.resolve();
        }
    })
    .add("delete 100 record lampen", {
        defer: true,
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await deleteBefore(lampen, 100);

            deferred.resolve();
        }
    })
    .add("Test added", {
        defer: true,
        fn: async function (deferred) {

            await fillTo(sizeCollection);

            deferred.resolve();
        }
    })
    /*
    .add("delete 1000 record lampen", {
        defer: true,
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await deleteBefore(lampen, 1000);

            deferred.resolve();
        }
    })
    .add("Test added", {
        defer: true,
        fn: async function (deferred) {

            await fillTo(sizeCollection);

            deferred.resolve();
        }
    })
            .add("delete 5K record lampen", {
        defer: true,
        minSamples: 30,
        fn: async function (deferred) {
            const lampen = await DB.collection("lamps");

            await deleteBefore(lampen, 5000);

            deferred.resolve();
        }
    })
    .add("Test added", {
        defer: true,
        fn: async function (deferred) {

            await fillTo(sizeCollection);

            deferred.resolve();
        }
    })
        */


    //TODO: fill to 50K records 

    //TODO: fill to 100K records 

    //TODO: fill to 500K records 

    //TODO: fill to 750K records 

    //TODO: fill to 1M records 

    //TODO: fill to 5M records 

    // Log benchmark results
    .on('cycle', async function (event) {
        console.log(String(event.target)); // Logs details of each benchmark
        // delete elements added 
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
