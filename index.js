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

function generateRandom16DigitNumber() {
    // Generate a random fractional number between 0 and 1
    const randomFraction = Math.random();

    // Multiply by 10^16 to get a 16-digit integer
    const random16DigitNumber = Math.floor(randomFraction * Math.pow(10, 16));

    // Ensure it's exactly 16 digits (pad with leading zeros if needed)
    const formattedNumber = random16DigitNumber.toString().padStart(16, '0');

    return formattedNumber;
}

setInterval(function () {
    let sql = ` SELECT * FROM subscribed_user_content WHERE DATE(NOW())=DATE(schedule_date) AND status='QUE' ORDER BY RAND() LIMIT 10`;
    db.query(sql, (err, data) => {
        if (err) {
            console.log(err);
        }
        if (data.length == 0) {
            console.log("No data found to sent");
        }
        for (let index = 0; index < data.length; index++) {
            const element = data[index];

            // Define the parameters (including one with spaces)
            const params = {
                Channel: '2',
                requestId: generateRandom16DigitNumber(),
                msisdn: element.msisdn,
                subscriptionOfferID: element.subscriptionOfferID,
                Language: 3,
                content: element.content,
            };

            // Encode each parameter and construct the query string
            const queryString = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');

            let hit_url = `http://103.170.139.30/bl_cgw/blSDPSMSSend.php?`; //for live
            hit_url += queryString;
            console.log('hit_url: ', hit_url);
            let options = {
                'method': 'GET',
                'url': hit_url,
            };
            let update_sql;
            request(hit_url, (error, response, body) => {
                if (error) {
                    console.error('Error:', error);
                    // Handle the error condition (e.g., network error)
                } else if (response.statusCode !== 200) {
                    console.error('API responded with status code:', response.statusCode);
                    // Handle non-success status codes (e.g., 404, 500, etc.)
                } else {
                    // Parse the API response (assuming it's JSON)
                    try {
                        if (body && body === 'success') {
                            update_sql = `UPDATE
                                subscribed_user_content
                                SET
                                status = 'SENT'
                                WHERE id = ${element.id}`;
                        } else {
                            update_sql = `UPDATE
                                subscribed_user_content
                                SET
                                status = 'FAILED'
                                WHERE id = ${element.id}`;
                            console.error('Unknown API response:', body);
                        }
                        console.log("update_sql: ", update_sql);
                        db.query(update_sql, (e, d) => {
                            if (e) {
                                console.log(e);
                            }
                            console.log('updated id: ', element.id);
                        })
                    } catch (parseError) {
                        console.error('Error parsing API response:', parseError);

                    }
                }
            });



        }

    })
    console.log(`call after 30 second`);
}, the_interval);


app.get('/app/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('from inside nodejs project');
})
app.listen(process.env.app_port, () => {
    console.log("server start in: ", process.env.app_port);
})