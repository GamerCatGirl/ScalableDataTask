var mysql = require('mysql2');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "timeSeries_123",
    port: '/tmp/mysql.sock',
    database: "time_series",
});
const sizeCollection = 20000;
const fs = require('fs'); //for file writing 
const lampen = "lamps"
const sensors = "sensors"
const elictricity = "wall_pluggs"
const Benchmark = require('benchmark');
const { timeStamp } = require('console');
const suite = new Benchmark.Suite("Insert test");
const duringFile = "output_during_sql.txt";
const doneFile = "output_sql.txt";
let toDelete = 0;
let printed = false;
let amountAddedLampen = 0;
let amountAddedElec = 0;
let amountAddedSensor = 0;

function randomTimestamp() {
    while (true) {
        const randomDate = new Date(new Date() - Math.random() * (1e+12)); // Generate random timestamp
        const hours = randomDate.getHours();
        const dateTimeSQL = randomDate.toISOString().slice(0, 19).replace('T', ' ');

        // Check if the time falls within the invalid 02:00 range
        if (hours !== 2) {
            return dateTimeSQL; // Return only valid timestamps
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function randomBoolean() {
    const number = getRandomInt(2);
    if (number == 1) {
        return true;
    } else {
        return false;
    }
}

function makeInsertLamp(name, time, percent, color) {
    var lampsName = "lamps "
    var columNames = "(deviceName, timeStamp, lightPercent, color)"
    var values = "(" + "'" + name + "', '" + time + "', " + percent + ", '" + color + "')"
    var insertQuery = "INSERT INTO " + lampsName + columNames + " VALUES " + values;
    //console.log(insertQuery)
    return insertQuery
}

function makeDocLamp(name, time, percent, color) {
    return { deviceName: name, lightPercent: percent, timeStamp: time, color: color };

}

function makeInsertSensor(name, time, temperature, humidity) {
    var sensorsName = "sensors "
    var columNames = "(deviceName, timeStamp, temperature, humidity)"
    var values = "(" + "'" + name + "', '" + time + "', " + temperature + ", " + humidity + ")"
    var insertQuery = "INSERT INTO " + sensorsName + columNames + " VALUES " + values;
    //console.log(insertQuery)
    return insertQuery;
}

function makeInsertPlugg(name, time, status, watt) {
    var wallPluggName = "wall_pluggs "
    var columNames = "(deviceName, timeStamp, status, watt)"
    var values = "(" + "'" + name + "', '" + time + "', " + status + ", " + watt + ")"
    var insertQuery = "INSERT INTO " + wallPluggName + columNames + " VALUES " + values;
    //console.log(insertQuery)
    return insertQuery
}


async function populateDatabaseLightsAddOne(amount) {

    for (let i = 0; i < amount; i++) {
        let timeStamp = randomTimestamp();
        const r = getRandomInt(255);
        const g = getRandomInt(255);
        const b = getRandomInt(255);
        const lamp = getRandomInt(100);
        const DeviceNameLamp = "Lamp " + lamp.toString();
        const LightPercent = getRandomInt(100);
        const color = "rgb( " + r + ", " + g + ", " + b + ")";
        const DocLamp = makeInsertLamp(DeviceNameLamp, timeStamp, LightPercent, color);

        try {
            await con.promise().query(DocLamp);
            amountAddedLampen += 1;
        } catch (error) {
            console.error(error);
        }

    }

    return;
}

async function populateDatabaseLights(amount) {

    const rows = [];

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

        rows.push([DocLamp.deviceName, DocLamp.lightPercent, DocLamp.timeStamp, DocLamp.color]);
    }
    //db.insertMany(elements);
    const query = `
            INSERT INTO lamps (deviceName, lightPercent, timeStamp, color)
            VALUES ?
        `;

    con.promise().query(query, [rows]);
}

function populateDatabaseSensor(amount) {

    for (let i = 0; i < amount; i++) {
        const timeStamp = randomTimestamp();
        const lamp = getRandomInt(100);
        const DeviceNameSensor = "Sensor " + lamp.toString();
        const Temperature = getRandomInt(150);
        const Humidity = getRandomInt(100);
        const DocSensor = makeInsertSensor(DeviceNameSensor, timeStamp, Temperature, Humidity);

        con.query(DocSensor, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted in sensors");
        });
    }

}

function populateDatabaseElectricity(amount) {

    for (let i = 0; i < amount; i++) {
        const timeStamp = randomTimestamp();
        const plugg = getRandomInt(100);
        const DeviceNameSensor = "Plugg " + plugg.toString();
        const On = randomBoolean();
        const Watt = getRandomInt(1000);
        const DocPlugg = makeInsertPlugg(DeviceNameSensor, timeStamp, On, Watt);

        con.query(DocPlugg, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted in pluggs");
        });

    }

}

function insert(doc) {
    con.query(doc, function (err, result) {
        if (err) throw err;
        console.log(doc);
    });
}

function makeLightElm(timeStamp) {
    const r = getRandomInt(255);
    const g = getRandomInt(255);
    const b = getRandomInt(255);
    const lamp = getRandomInt(100);
    const DeviceNameLamp = "Lamp " + lamp.toString();
    const LightPercent = getRandomInt(100);
    const color = "rgb( " + r + ", " + g + ", " + b + ")";
    const DocLamp = makeInsertLamp(DeviceNameLamp, timeStamp, LightPercent, color);
    return DocLamp;
}

function makeSensorElm(timeStamp) {
    const lamp = getRandomInt(100);
    const DeviceNameSensor = "Sensor " + lamp.toString();
    const Temperature = getRandomInt(150);
    const Humidity = getRandomInt(100);
    const DocSensor = makeInsertSensor(DeviceNameSensor, timeStamp, Temperature, Humidity);
    return DocSensor;
}

function makeElecElm(timeStamp) {
    const plugg = getRandomInt(100);
    const DeviceNameSensor = "Plugg " + plugg.toString();
    const On = randomBoolean();
    const Watt = getRandomInt(1000);
    const DocPlugg = makeInsertPlugg(DeviceNameSensor, timeStamp, On, Watt);
    return DocPlugg;
}

function addSeconds(timeStamp) {
    console.log(timeStamp);
    let [date, time] = timeStamp.split(" ");
    let [hour, minute, seconds] = time.split(":");
    let newSeconds = Number.parseInt(seconds) + 5;
    let newMinute = Number.parseInt(minute);
    let newHour = Number.parseInt(hour);
    if (newSeconds > 59) {
        newSeconds -= 60;
        newMinute += 1
    }
    if (newMinute > 59) {
        newMinute -= 60;
        newHour += 1
    }

    if (newHour < 10) {
        newHour = "0" + newHour.toString();
    }
    if (newMinute < 10) {
        newMinute = "0" + newMinute.toString();
    }
    if (newSeconds < 10) {
        newSeconds = "0" + newSeconds.toString();
    }

    return date + " " + newHour + ":" + newMinute + ":" + newSeconds;
}

async function loop(startTime, currentTime, stopTime) {
    if (currentTime < stopTime) {
        //1. add data 

        const docLamp = makeLightElm(currentTime);
        await insert(docLamp);
        const docSensor = makeSensorElm(currentTime);
        await insert(docSensor);
        const docElec = makeElecElm(currentTime);
        await insert(docElec);

        //2. sleep 5seconds 
        ///*setTimeout(() => {
        //3set currentTime
        //const currentTimeIso = currentTime.replace(' ', 'T');
        //console.log("currentTime: " + currentTime);
        let newTime = addSeconds(currentTime);
        //let time = new Date(t + 5000);
        //let time = new Date(t.getTime + 5000); //add 5000 ms 
        //console.log("new time: " + newTime);

        //newTime = t.toISOString().slice(0, 19).replace('T', ' ');
        //console.log(newTime);
        loop(startTime, newTime, stopTime);
        //return "done"
        //}, 5000);
    } else {
        con.end();
        console.log(startTime);
        console.log(stopTime);
    }
}

function addhours(hours) {
    const date = new Date();
    const hoursToAdd = hours * 60 * 60 * 1000;
    date.setTime(date.getTime() + hoursToAdd);
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

async function fillTo(amount) {

    // Count the number of rows in each table
    const [rowsLampen] = await con.promise().query(`SELECT COUNT(*) AS count FROM ??`, [lampen]);
    const [rowsSensor] = await con.promise().query(`SELECT COUNT(*) AS count FROM ??`, [sensors]);
    const [rowsElec] = await con.promise().query(`SELECT COUNT(*) AS count FROM ??`, [elictricity]);

    if (rowsLampen.length === 0 || rowsSensor === 0 || rowsElec === 0) {
        throw new Error('No rows returned');
    }

    // Extract the count
    const countLampen = rowsLampen[0].count;
    const countSensors = rowsSensor[0].count;
    const countElec = rowsElec[0].count;

    // Calculate how many entries need to be added
    const toFillLampen = amount - countLampen;
    const toFillSensors = amount - countSensors;
    const toFillElec = amount - countElec;

    // Log the counts if not already printed
    if (!printed) {
        console.log(toFillLampen);
        console.log(toFillSensors);
        console.log(toFillElec);
        printed = true;
    }

    // Call functions to populate the database
    await populateDatabaseElectricity(toFillElec);
    await populateDatabaseLightsAddOne(toFillLampen);
    await populateDatabaseSensor(toFillSensors);
}

async function populateDatabases() {
    //const startTime = new Date().toISOString().slice(0, 19).replace('T', ' ');;
    const startTime = "2024-11-30 08:14:02"
    const stopTime = "2024-11-30 13:16:39"

    let currentTime = startTime;

    const done = await loop(startTime, currentTime, stopTime)
    return done;
}

async function fetchDataPluggsName() {
    const sensor = getRandomInt(100);
    const DeviceNamePlugg = `Plugg ${sensor}`;
    const [results] = await con.promise().query(
        `SELECT * FROM ?? WHERE deviceName = ?`,
        [elictricity, DeviceNamePlugg]
    );
    return results;
}

async function fetchDataSensorName() {
    const sensor = getRandomInt(100);
    const DeviceNameSensor = `Sensor ${sensor}`;
    const [results] = await con.promise().query(
        `SELECT * FROM ?? WHERE deviceName = ?`,
        [sensors, DeviceNameSensor]
    );
    return results;
}

async function fetchDataLampName() {
    const lamp = getRandomInt(100);
    const DeviceNameLamp = `Lamp ${lamp}`;
    const [results] = await con.promise().query(
        `SELECT * FROM ?? WHERE deviceName = ?`,
        [lampen, DeviceNameLamp]
    );
    return results;
}

function makeRGB() {
    const r = getRandomInt(255);
    const g = getRandomInt(255);
    const b = getRandomInt(255);
    const color = "rgb( " + r + ", " + g + ", " + b + ")";
    return color;
}

function formatDateForSQL(date) {
    return date.toISOString().replace('T', ' ').split('.')[0]; // Remove 'T' and milliseconds
}

async function findLast(tableName, time) {
    // Step 1: Get the most recent timestamp
    const [mostRecentRow] = await con.promise().query(
        `SELECT timeStamp FROM ?? ORDER BY timeStamp DESC LIMIT 1`,
        [tableName]
    );

    if (mostRecentRow.length === 0) {
        console.log('No data found.');
        return [];
    }

    const mostRecentTimestamp = mostRecentRow[0].timeStamp;

    // Step 2: Define the range (time minutes earlier than the most recent timestamp)
    const oneMinuteEarlier = new Date(mostRecentTimestamp);
    oneMinuteEarlier.setMinutes(oneMinuteEarlier.getMinutes() - time);

    const formattedOneMinuteEarlier = formatDateForSQL(oneMinuteEarlier);
    const formattedMostRecentTimestamp = formatDateForSQL(mostRecentTimestamp);


    // Step 3: Query all rows in the range
    const [result] = await con.promise().query(
        `SELECT * FROM ?? WHERE timeStamp >= ? AND timeStamp < ?`,
        [tableName, formattedOneMinuteEarlier, formattedMostRecentTimestamp]
    );

    return result;
}


async function deleteBefore(tableName, amount) {
    const cutoffDate = '2024-11-25 00:00:00';

    for (let i = 0; i < amount; i++) {
        await con.promise().query(
            `DELETE FROM ?? WHERE timeStamp < ? LIMIT 1`,
            [tableName, cutoffDate],
            (error, results) => {
                if (error) {
                    console.error('Error deleting record:', error);
                    throw error; // Stop execution if there's an error
                }
                // Stop loop early if no rows were deleted
                if (results.affectedRows === 0) {
                    console.log('No more records to delete.');
                    return;
                }
            }
        );
    }
}

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");

    suite
        .on('start', async function () {
            let time = new Date();
            fs.appendFile(duringFile, String(time), (err) => { if (err) throw err });
            fs.appendFile(duringFile, "\n", (err) => { if (err) throw err });
            console.log("start suite");
        })
        .add("deleting and filling database to wanted amount", {
            defer: true,
            fn: async function (deferred) {

                await deleteBefore(lampen, toDelete);
                toDelete = 0;

                await fillTo(sizeCollection);
                deferred.resolve();

                amountAddedLampen = 0;
            }
        })

        /*
        //setup benchmarks 
        //fill database to 20000 records first 
        .add("fetch all lights of same id", { //TODO: convert to sql 
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {

                const results = await fetchDataLampName();
                //console.log(`Fetched ${results.length} records.`);
                deferred.resolve();
            }
        })
        .add("fetch all sensonrs of same id", { //TODO: convert to sql 
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {

                const results = await fetchDataSensorName();
                //console.log(`Fetched ${results.length} records.`);
                deferred.resolve();
            }
        })
        .add("fetch all pluggs of same id", { //TODO: convert to sql 
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {

                const results = await fetchDataPluggsName();
                //console.log(`Fetched ${results.length} records.`);
                deferred.resolve();
            }
        })
        .add("fetch all of same id", { //TODO: convert to sql 
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {
                const id = getRandomInt(100);
                const DeviceNamePlugg = `Plugg ${id}`;
                const DeviceNameLamp = `Lamp ${id}`;
                const DeviceNameSensor = `Sensor ${id}`;

                const queryMostRecent = async (tableName, deviceName) => {
                    const [results] = await con.promise().query(
                        `SELECT * FROM ?? WHERE deviceName = ? ORDER BY timeStamp DESC LIMIT 1`,
                        [tableName, deviceName]
                    );
                    return results[0]; // Return the most recent record
                };

                await queryMostRecent(lampen, DeviceNameLamp);
                await queryMostRecent(elictricity, DeviceNamePlugg);
                await queryMostRecent(sensors, DeviceNameSensor);


                //console.log(`Fetched ${results.length} records.`);
                deferred.resolve();
            }
        })
        .add("fetch all last minute -- lamp (20000 records)", {
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {
                await findLast(lampen, 1);
                deferred.resolve();
            }
        })
        .add("fetch all last minute -- sensor (20000 records)", {
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {
                await findLast(sensors, 1);
                deferred.resolve();
            }
        })

        .add("fetch all last minute -- pluggs (20000 records)", {
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {
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
                await findLast(lampen, 10);
                deferred.resolve();
            }
        })

        .add("fetch all last 10 minutes -- sensor (20000 records)", {
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {
                await findLast(sensors, 10);
                deferred.resolve();
            }
        })

        .add("fetch all last 10 minutes -- pluggs (20000 records)", {
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {
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
                await findLast(lampen, 60);
                deferred.resolve();
            }
        })

        .add("fetch all last hour -- sensor (20000 records)", {
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {
                await findLast(sensors, 60);
                deferred.resolve();
            }
        })

        .add("fetch all last hour -- pluggs (20000 records)", {
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {
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
                await findLast(lampen, 720);
                deferred.resolve();
            }
        })

        .add("fetch all last 12 hours -- sensor (20000 records)", {
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {
                await findLast(sensors, 720);
                deferred.resolve();
            }
        })

        .add("fetch all last 12 hours -- pluggs (20000 records)", {
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {
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
                await findLast(lampen, 1440);
                deferred.resolve();
            }
        })

        .add("fetch all last 24 hours -- sensor (20000 records)", {
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {
                await findLast(sensors, 1440);
                deferred.resolve();
            }
        })

        .add("fetch all last 24 hours -- pluggs (20000 records)", {
            defer: true, //allows async operations
            minSamples: 30,
            maxTime: 10,
            fn: async function (deferred) {
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

                await findLast(elictricity, 1440);
                await findLast(sensors, 1440);
                await findLast(lampen, 1440);

                deferred.resolve();
            }
        })
        .add("update 1 value in a row - lampen (20000 records)", {
            defer: true, // allows async operations
            minSamples: 30,
            fn: async function (deferred) {
                const lamp = getRandomInt(100);
                const DeviceNameLamp = `Lamp ${lamp}`;

                // New value for the `lightPercent` field
                const updateValue = getRandomInt(100);

                // MySQL update query
                const query = `
                    UPDATE lamps 
                    SET lightPercent = ? 
                    WHERE deviceName = ?
                    LIMIT 1
                `;

                try {
                    await con.promise().query(query, [updateValue, DeviceNameLamp]);
                    deferred.resolve();
                } catch (error) {
                    console.error('Error updating the row:', error);
                    deferred.reject(error);
                }
            }
        })
        .add("update 2 values in a row - lampen (20000 records)", {
            defer: true, // allows async operations
            minSamples: 30,
            fn: async function (deferred) {
                const lamp = getRandomInt(100);
                const DeviceNameLamp = `Lamp ${lamp}`;

                // New values for the fields
                const updateValue = getRandomInt(100);
                const colorUpdate = makeRGB(); // Generate RGB value

                // MySQL update query
                const query = `
                    UPDATE lamps 
                    SET lightPercent = ?, color = ? 
                    WHERE deviceName = ?
                    LIMIT 1
                `;

                try {
                    await con.promise().query(query, [updateValue, colorUpdate, DeviceNameLamp]);
                    deferred.resolve();
                } catch (error) {
                    console.error('Error updating the row:', error);
                    deferred.reject(error);
                }
            }
        })
        .add("update 3 values in a row - lampen (20000 records)", {
            defer: true, // allows async operations
            minSamples: 30,
            fn: async function (deferred) {
                const lamp = getRandomInt(100);
                const DeviceNameLamp = `Lamp ${lamp}`;

                // New values for the fields
                const updateValue = getRandomInt(100);
                const colorUpdate = makeRGB(); // Generate RGB value

                const newId = getRandomInt(100);
                const newName = "Lamp " + newId.toString();

                // MySQL update query
                const query = `
                    UPDATE lamps 
                    SET lightPercent = ?, color = ?, deviceName = ?
                    WHERE deviceName = ?
                    LIMIT 1
                `;

                try {
                    await con.promise().query(query, [updateValue, colorUpdate, newName, DeviceNameLamp]);
                    deferred.resolve();
                } catch (error) {
                    console.error('Error updating the row:', error);
                    deferred.reject(error);
                }
            }
        })
        .add("update 1 column - lampen (20000 records)", {
            defer: true, // allows async operations
            minSamples: 30,
            fn: async function (deferred) {
                const lamp = getRandomInt(100);
                const DeviceNameLamp = `Lamp ${lamp}`;

                // New value for the `lightPercent` field
                const updateValue = getRandomInt(100);

                // MySQL update query
                const query = `
                    UPDATE lamps 
                    SET lightPercent = ? 
                    WHERE deviceName = ?
                    LIMIT 1
                `;


                try {
                    await con.promise().query(query, [updateValue, DeviceNameLamp]);
                    deferred.resolve();
                } catch (error) {
                    console.error('Error updating the row:', error);
                    deferred.reject(error);
                }
            }
        })
        .add("update 2 column - lampen (20000 records)", {
            defer: true, // allows async operations
            minSamples: 30,
            fn: async function (deferred) {
                const lamp = getRandomInt(100);
                const lamp2 = getRandomInt(100);
                const DeviceNameLamp = `Lamp ${lamp}`;
                const DeviceNameLamp2 = `Lamp ${lamp2}`;

                // New value for the `lightPercent` field
                const updateValue = getRandomInt(100);

                // MySQL update query
                const query = `
                    UPDATE lamps 
                    SET lightPercent = ? 
                    WHERE deviceName = ?
                    LIMIT 1
                `;


                try {
                    await con.promise().query(query, [updateValue, DeviceNameLamp]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp2]);
                    deferred.resolve();
                } catch (error) {
                    console.error('Error updating the row:', error);
                    deferred.reject(error);
                }
            }
        })
        .add("update 5 column - lampen (20000 records)", {
            defer: true, // allows async operations
            minSamples: 30,
            fn: async function (deferred) {
                const lamp = getRandomInt(100);
                const lamp2 = getRandomInt(100);
                const lamp3 = getRandomInt(100);
                const lamp4 = getRandomInt(100);
                const lamp5 = getRandomInt(100);
                const DeviceNameLamp = `Lamp ${lamp}`;
                const DeviceNameLamp2 = `Lamp ${lamp2}`;
                const DeviceNameLamp3 = `Lamp ${lamp3}`;
                const DeviceNameLamp4 = `Lamp ${lamp4}`;
                const DeviceNameLamp5 = `Lamp ${lamp5}`;

                // New value for the `lightPercent` field
                const updateValue = getRandomInt(100);

                // MySQL update query
                const query = `
                    UPDATE lamps 
                    SET lightPercent = ? 
                    WHERE deviceName = ?
                    LIMIT 1
                `;


                try {
                    await con.promise().query(query, [updateValue, DeviceNameLamp]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp2]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp3]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp4]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp5]);
                    deferred.resolve();
                } catch (error) {
                    console.error('Error updating the row:', error);
                    deferred.reject(error);
                }
            }
        })
        .add("update 10 column - lampen (20000 records)", {
            defer: true, // allows async operations
            minSamples: 30,
            fn: async function (deferred) {
                const lamp = getRandomInt(100);
                const lamp2 = getRandomInt(100);
                const lamp3 = getRandomInt(100);
                const lamp4 = getRandomInt(100);
                const lamp5 = getRandomInt(100);
                const lamp6 = getRandomInt(100);
                const lamp7 = getRandomInt(100);
                const lamp8 = getRandomInt(100);
                const lamp9 = getRandomInt(100);
                const lamp10 = getRandomInt(100);
                const DeviceNameLamp = `Lamp ${lamp}`;
                const DeviceNameLamp2 = `Lamp ${lamp2}`;
                const DeviceNameLamp3 = `Lamp ${lamp3}`;
                const DeviceNameLamp4 = `Lamp ${lamp4}`;
                const DeviceNameLamp5 = `Lamp ${lamp5}`;
                const DeviceNameLamp6 = `Lamp ${lamp6}`;
                const DeviceNameLamp7 = `Lamp ${lamp7}`;
                const DeviceNameLamp8 = `Lamp ${lamp8}`;
                const DeviceNameLamp9 = `Lamp ${lamp9}`;
                const DeviceNameLamp10 = `Lamp ${lamp10}`;

                // New value for the `lightPercent` field
                const updateValue = getRandomInt(100);

                // MySQL update query
                const query = `
                    UPDATE lamps 
                    SET lightPercent = ? 
                    WHERE deviceName = ?
                    LIMIT 1
                `;


                try {
                    await con.promise().query(query, [updateValue, DeviceNameLamp]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp2]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp3]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp4]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp5]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp6]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp7]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp8]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp9]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp10]);
                    deferred.resolve();
                } catch (error) {
                    console.error('Error updating the row:', error);
                    deferred.reject(error);
                }
            }
        })
        .add("update 20 column - lampen (20000 records)", {
            defer: true, // allows async operations
            minSamples: 30,
            fn: async function (deferred) {
                const lamp = getRandomInt(100);
                const lamp2 = getRandomInt(100);
                const lamp3 = getRandomInt(100);
                const lamp4 = getRandomInt(100);
                const lamp5 = getRandomInt(100);
                const lamp6 = getRandomInt(100);
                const lamp7 = getRandomInt(100);
                const lamp8 = getRandomInt(100);
                const lamp9 = getRandomInt(100);
                const lamp10 = getRandomInt(100);
                const lamp11 = getRandomInt(100);
                const lamp12 = getRandomInt(100);
                const lamp13 = getRandomInt(100);
                const lamp14 = getRandomInt(100);
                const lamp15 = getRandomInt(100);
                const lamp16 = getRandomInt(100);
                const lamp17 = getRandomInt(100);
                const lamp18 = getRandomInt(100);
                const lamp19 = getRandomInt(100);
                const lamp20 = getRandomInt(100);
                const DeviceNameLamp = `Lamp ${lamp}`;
                const DeviceNameLamp2 = `Lamp ${lamp2}`;
                const DeviceNameLamp3 = `Lamp ${lamp3}`;
                const DeviceNameLamp4 = `Lamp ${lamp4}`;
                const DeviceNameLamp5 = `Lamp ${lamp5}`;
                const DeviceNameLamp6 = `Lamp ${lamp6}`;
                const DeviceNameLamp7 = `Lamp ${lamp7}`;
                const DeviceNameLamp8 = `Lamp ${lamp8}`;
                const DeviceNameLamp9 = `Lamp ${lamp9}`;
                const DeviceNameLamp10 = `Lamp ${lamp10}`;
                const DeviceNameLamp11 = `Lamp ${lamp11}`;
                const DeviceNameLamp12 = `Lamp ${lamp12}`;
                const DeviceNameLamp13 = `Lamp ${lamp13}`;
                const DeviceNameLamp14 = `Lamp ${lamp14}`;
                const DeviceNameLamp15 = `Lamp ${lamp15}`;
                const DeviceNameLamp16 = `Lamp ${lamp16}`;
                const DeviceNameLamp17 = `Lamp ${lamp17}`;
                const DeviceNameLamp18 = `Lamp ${lamp18}`;
                const DeviceNameLamp19 = `Lamp ${lamp19}`;
                const DeviceNameLamp20 = `Lamp ${lamp20}`;

                // New value for the `lightPercent` field
                const updateValue = getRandomInt(100);

                // MySQL update query
                const query = `
                    UPDATE lamps 
                    SET lightPercent = ? 
                    WHERE deviceName = ?
                    LIMIT 1
                `;


                try {
                    await con.promise().query(query, [updateValue, DeviceNameLamp]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp2]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp3]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp4]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp5]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp6]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp7]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp8]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp9]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp10]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp11]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp12]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp13]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp14]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp15]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp16]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp17]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp18]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp19]);
                    await con.promise().query(query, [updateValue, DeviceNameLamp20]);
                    deferred.resolve();
                } catch (error) {
                    console.error('Error updating the row:', error);
                    deferred.reject(error);
                }
            }
        })
            */

        .add("addOne write 1", { //max +- 150 rows
            minSamples: 10,
            defer: true,
            maxTime: 0.05,
            fn: async function (deferred) {
                await populateDatabaseLightsAddOne(1, lampen);
                deferred.resolve();
            }
        })
        .add("Test deleted?", {
            defer: true,
            fn: async function (deferred) {
                try {
                    //check how many values 
                    const [rowsLampen] = await con.promise().query(`SELECT COUNT(*) AS count FROM ??`, [lampen]);

                    if (rowsLampen.length === 0) {
                        throw new Error('No rows returned');
                    }

                    //TODO: write the count to file to then calculate the duration 
                    // Extract the count
                    const countLampen = rowsLampen[0].count;

                    const lampsToDelete = countLampen - sizeCollection;

                    // Delete all records or a specific number
                    await deleteBefore(lampen, lampsToDelete);
                    // Reset the counter
                    amountAddedLampen = 0;
                    deferred.resolve();

                } catch (error) {
                    console.error('Error deleting records:', error);
                    deferred.reject(error);
                }
            }
        })
        .add("addOne write 10", { //max +- 150 rows
            defer: true, // allows async operations
            minSamples: 10,
            maxTime: 0.05,
            fn: async function (deferred) {

                try {
                    // Add one record
                    await populateDatabaseLightsAddOne(10, lampen);
                    //amountAddedLampen += 10;

                    deferred.resolve();
                } catch (error) {
                    console.error('Error adding a record:', error);
                    deferred.reject(error);
                }
            }
        })
        .add("Test deleted?", {
            defer: true,
            fn: async function (deferred) {
                try {
                    const [rowsLampen] = await con.promise().query(`SELECT COUNT(*) AS count FROM ??`, [lampen]);

                    if (rowsLampen.length === 0) {
                        throw new Error('No rows returned');
                    }

                    // Extract the count
                    const countLampen = rowsLampen[0].count;
                    console.log(countLampen);
                    // Delete all records or a specific number
                    const lampsToDelete = countLampen - sizeCollection;

                    // Delete all records or a specific number
                    await deleteBefore(lampen, lampsToDelete);

                    // Reset the counter
                    amountAddedLampen = 0;

                    deferred.resolve();
                } catch (error) {
                    console.error('Error deleting records:', error);
                    deferred.reject(error);
                }
            }
        })

        .on('cycle', async function (event) {
            console.log(String(event.target)); // Logs details of each benchmark
            let time = new Date()
            fs.appendFile(duringFile, String(time), (err) => { if (err) throw err });
            fs.appendFile(duringFile, "\n", (err) => { if (err) throw err });
            fs.appendFile(duringFile, String(event.target), (err) => { if (err) throw err });
            fs.appendFile(duringFile, "\n", (err) => { if (err) throw err });
            // delete elements added 
        })



        .on('complete', function () {
            console.log('All benchmarks completed.');
            let time = new Date()
            fs.appendFile(duringFile, String(time), (err) => { if (err) throw err });

            let file = doneFile;

            this.forEach(benchmark => {
                // write to csv 
                let benchmarkName = `Benchmark: ${benchmark.name}`
                let meanTime = `- Mean time: ${benchmark.stats.mean * 1000} ms`
                let runs = `- Runs: ${benchmark.stats.sample.length}`
                let totalTime = `- Total time: ${(benchmark.stats.sample.length * benchmark.stats.mean * 1000).toFixed(2)} ms`;

                fs.appendFile(file, benchmarkName, (err) => { if (err) throw err; });
                fs.appendFile(file, "\n", (err) => { if (err) throw err });
                fs.appendFile(file, meanTime, (err) => { if (err) throw err; });
                fs.appendFile(file, "\n", (err) => { if (err) throw err });
                fs.appendFile(file, runs, (err) => { if (err) throw err; });
                fs.appendFile(file, "\n", (err) => { if (err) throw err });
                fs.appendFile(file, totalTime, (err) => { if (err) throw err; });
                fs.appendFile(file, "\n", (err) => { if (err) throw err });

                //fs.write()
                console.log(benchmarkName);
                console.log(meanTime);
                console.log(runs);
                console.log(totalTime);
            });

            con.end()
            console.log('Database disconnected.');
        })
        .run({ async: true });


    //const DocLamp = makeDocLamp(DeviceNameLamp, timeStamp, LightPercent, color);
    /*
    var sql = "CREATE TABLE sensors (deviceName VARCHAR(255), timeStamp TIMESTAMP, temperature INT, humidity INT)";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });
    var sql = "CREATE TABLE wall_pluggs (deviceName VARCHAR(255), timeStamp TIMESTAMP, status BOOL, watt INT)";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });
    con.query("CREATE DATABASE time_series;", function (err, result) {
        if (err) throw err;
        console.log("Database succesfully created!");
    });
    */

    //populateDatabaseLights(1)
    //populateDatabaseElectricity(1)
    //populateDatabaseSensor(1)

    //populateDatabases();
    /*
    con.query("SELECT * FROM lamps", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });

    con.query("SHOW DATABASES;", function (err, result) {
        if (err) throw err;
        console.log("Showing databases\n");
        for (var i = 0; i < result.length; i++) {
            console.log(JSON.stringify(result[i]));
        }
    })
        */
    //con.end();
});