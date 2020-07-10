'use strict'

console.log('It works!');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

let db = require('./SqliteDataBase/users.js')

//app.use(express.static(__dirname + '/public'));

app.get("/api/users", (req, res, next) => {
    console.log(db.createUser("admin", "admin@d.com", 11111));
});

app.listen(8080, () => console.log('Server running at http://localhost:8080'));
