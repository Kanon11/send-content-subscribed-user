require("dotenv").config();
const express = require("express");
const app = express();
var cors = require('cors');
const mysql = require("mysql");
const bodyParser = require('body-parser');
const request = require('request');

app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.db_server,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_name
});

db.connect((error) => {
    if (error) {
        throw error;
    }
    console.log("Mysql connected...");
})
app.use(cors());

// let minutes = 5;
// let the_interval = minutes * 60 * 1000;
let the_interval = 30000; // 30 sec


app.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('from inside nodejs project');
})
app.listen(process.env.app_port, () => {
    console.log("server start in: ", process.env.app_port);
})