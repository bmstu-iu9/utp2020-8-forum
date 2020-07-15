'use strict'

const sqlite = require('better-sqlite3');

exports.init = () => {
  let db = new sqlite('./UsersDataBase/users.db');
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login text UNIQUE,
    password text
    )`
  ).run();
  return db;
}

const findUser = (data, login) => {
  return data.prepare('SELECT * FROM users WHERE trim(login) = ?').get(login);
}

exports.checkUserExists = (data, login) => {
  let usr = findUser(data, login);
  return usr !== undefined;
}


exports.createUser = (data, login, psswrd) => {
  data.prepare('INSERT INTO users (login, password) VALUES (?,?)').run(login, psswrd);
}

exports.findUser = findUser;
