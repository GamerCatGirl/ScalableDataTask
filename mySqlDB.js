var mysql = require('mysql2');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "timeSeries_123",
    port: '/tmp/mysql.sock',
    database: "time_series",
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    /*
    con.query("CREATE DATABASE time_series;", function (err, result) {
        if (err) throw err;
        console.log("Database succesfully created!");
    });
    */
    con.query("SHOW DATABASES;", function (err, result) {
        if (err) throw err;
        console.log("Showing databases\n");
        for (var i = 0; i < result.length; i++) {
            console.log(JSON.stringify(result[i]));
        }
    })
    con.end();
});