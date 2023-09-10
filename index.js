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

// let the_interval = minutes * 60 * 1000;
let the_interval = 30000; // 30 sec

setInterval(function () {
    // let sql = ` SELECT * FROM mk_users_content_records WHERE DATE(NOW())=DATE(created_at) AND delivary_status='QUE' ORDER BY RAND() LIMIT 10`;
    // db.query(sql, (err, data) => {
    //     if (err) {
    //         console.log(err);
    //     }
    //     for (let index = 0; index < data.length; index++) {
    //         const element = data[index];
    //         let hit_url = `https://api.super5vip.com/api/mk/sendmt?to=${element.msisdn}`; //for live
    //         // let hit_url = `http://127.0.0.1:8000/api/mk/sendmt?to=${element.msisdn}`;  // for local
    //         let options = {
    //             'method': 'GET',
    //             'url': hit_url,
    //         };
    //         request(options, function (error, response) {

    //             if (error) throw new Error(error);
    //             console.log(response.body);
    //             let usql = `UPDATE
    //                             mk_users_content_records
    //                             SET
    //                             delivary_status = 'SENT',
    //                             updated_at = NOW()
    //                             WHERE id = ${element.id}`;
    //             db.query(usql, (e, d) => {
    //                 if (e) {
    //                     console.log(e);
    //                 }
    //                 console.log('updated id: ', element.id);
    //             })

    //         });


    //     }

    // })
    console.log(`call after 30 second`);
}, the_interval);


app.get('/app/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('from inside nodejs project');
})
app.listen(process.env.app_port, () => {
    console.log("server start in: ", process.env.app_port);
})