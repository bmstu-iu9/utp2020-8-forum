const sqlite = require('better-sqlite3');

exports.init = () => {
  let db = new sqlite('./UsersDataBase/users.db', {verbose: console.log});
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text UNIQUE,
    email text UNIQUE,
    password text
    )`
  ).run();
  return db;
}



const checkUserExists = (data, name) => {
  let usr = data.prepare('SELECT * FROM users WHERE trim(name) = ?').get(name);
  return usr !== undefined;
}

exports.createUser = (data, name, email, psswrd) => {
  if (checkUserExists(data, name)) {
      console.log('Choose another nickname!');
  } else {
      data.prepare('INSERT INTO users (name, email, password) VALUES (?,?,?)').run(name, email, psswrd);
  }
}

exports.checkUserExists = checkUserExists;
