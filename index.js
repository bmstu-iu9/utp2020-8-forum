'use strict'

console.log('It works!');

const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const fs = require('fs');

const authModule = require('./UsersDataBase/auth.js');

const app = express();
const port = 8080;

app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.engine('hbs', exphbs({
    extname: '.hbs'
}));

app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public'));

app.use('/styles', express.static(__dirname + '/styles'));

app.use('/scripts', express.static(__dirname + '/scripts'));

app.use(
  session({
    secret: 'thatisasecret',
    store: new FileStore(),
    cookie: {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    },
    resave: false,
    saveUninitialized: false,
  })
);

require('./UsersDataBase/passport-config.js');
app.use(passport.initialize());
app.use(passport.session());


app.get('/signup', (req, res) => {
  res.render('signup');
  console.log("User is at signup page");
});

app.post('/signup', (req, res) => {
  const { login, psw, pswConf } = req.body;
    if (psw === pswConf) {
      let users = JSON.parse(fs.readFileSync('./UsersDataBase/users.json', 'utf-8'));
      if (users[login] !== undefined) {
        res.render('signup', {
                message: 'User exists.',
                messageClass: 'alert-danger'
            });
      } else {
        const hashedPassword = authModule.getHashedPassword(psw);
        users[login] = {
          "login": login,
          "psw": hashedPassword
        }
        fs.writeFileSync('./UsersDataBase/users.json', JSON.stringify(users));
        res.redirect('/login');
      }
    } else {
      res.render('signup', {
          message: 'Password does not match.',
          messageClass: 'alert-danger'
      });
    }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  passport.authenticate('local', function(err, user) {
  if (err) {
    return next(err);
  }
  if (!user) {
    return res.send('Укажите правильный email или пароль!');
  }
  req.logIn(user, function(err) {
    if (err) {
      return next(err);
    }
    return res.redirect('/signup');
  });
})(req, res);
});

app.get('/', (req, res) => {
  res.redirect('/signup');
});

app.listen(8080, () => console.log('Server running at http://localhost:8080'));
