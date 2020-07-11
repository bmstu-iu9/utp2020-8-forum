'use strict'

console.log('It works!');

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 8080;

let sqlite = require('./UsersDataBase/users.js')
const parser = bodyParser.urlencoded({extended: false});

const db = sqlite.init();

app.use(express.static(__dirname + '/public'));

app.use('/styles', express.static(__dirname + '/styles'));

app.use('/scripts', express.static(__dirname + '/scripts'))

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/public/signup.html');
  console.log("User is at signup page");
});

app.post('/signup', parser, (req, res) => {
  console.log(req.body);
  let user = req.body;
  sqlite.createUser(db, user.login, user.email, user.psw);
});

app.get("/users", (req, res, next) => {
  let rows = db.prepare('select * from users').all();
  res.json({
      "data":rows
  });
});

app.listen(8080, () => console.log('Server running at http://localhost:8080'));
