const sqlite = require('sqlite3').verbose();

let users = new sqlite.Database('./SqliteDataBase/users.sqlite', (err) => {
  if (err) {
    console.log(err);
  } else {
        console.log('Connecting database of users...');
        users.run(`CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name text UNIQUE,
          email text UNIQUE,
          password text
          )`, (error) => {
            if (error) {
              console.log('Table users exists!');
            } else {
                let insert = 'INSERT INTO users (name, email, password) VALUES (?,?,?)';
                users.run(insert, ["admin","admin@example.com", "12345"]);
                console.log('Table users was created. You can enter the web site with login: admin psswrd: 12345');
            }
        });
    }
});

const checkUserExists = (name) => {
  let sql = 'SELECT * FROM users WHERE trim(name) LIKE \'' + name + '\'';
  users.get(sql, [], (err, row) => {
    if (err) {
      return console.error(err);
    }
    return row ? true : false;
  });
}

const createUser = (name, email, psswrd) => {
  if (checkUserExists(name)) {
      reject('Choose another nickname!');
  } else {
      users.run('INSERT INTO users (name, email, password) VALUES (?,?,?)', [name, email, psswrd]);
  }
}

module.exports = users;
module.exports.createUser = createUser;
