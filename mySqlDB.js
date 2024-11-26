var mysql = require('mysql2');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "timeSeries_123",
    port: '/tmp/mysql.sock',
    database: "time_series",
});

function randomTimestamp() {
    var dataTime = new Date(new Date() - Math.random() * (1e+12))
    var dateTimeSQL = dataTime.toISOString().slice(0, 19).replace('T', ' ');
    return dateTimeSQL
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

function populateDatabaseLights(amount) {

    for (let i = 0; i < amount; i++) {
        const timeStamp = randomTimestamp();
        const r = getRandomInt(255);
        const g = getRandomInt(255);
        const b = getRandomInt(255);
        const lamp = getRandomInt(100);
        const DeviceNameLamp = "Lamp " + lamp.toString();
        const LightPercent = getRandomInt(100);
        const color = "rgb( " + r + ", " + g + ", " + b + ")";
        const DocLamp = makeInsertLamp(DeviceNameLamp, timeStamp, LightPercent, color);

        con.query(DocLamp, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted in lamps");
        });
    }
    //db.insertMany(elements);

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
        console.log("start sleeping...")
        setTimeout(() => {
            //3set currentTime
            console.log("sleep done");
            newTime = new Date().toISOString().slice(0, 19).replace('T', ' ');;
            loop(startTime, newTime, stopTime);
            return "done"
        }, 5000);
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

async function populateDatabases() {
    const startTime = new Date().toISOString().slice(0, 19).replace('T', ' ');;
    const stopTime = addhours(24);

    let currentTime = startTime;

    const done = await loop(startTime, currentTime, stopTime)
    return done;
}

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");


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

    populateDatabases();
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