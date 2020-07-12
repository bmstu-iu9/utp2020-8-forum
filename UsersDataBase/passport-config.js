'use strict'

const passport = require('passport');
const session = require("express-session");
const fs = require("fs");
const authModule = require('./auth.js');
const LocalStrategy = require('passport-local').Strategy;

const userDB = {
  id: 136345,
  email: 'test@mail.ru',
  password: '123',
};

passport.serializeUser(function(user, done) {
  done(null, user.login);
});

passport.deserializeUser(function(login, done) {
  let user = JSON.parse(fs.readFileSync("./users.json", "utf-8"))[login];
	done(null, user);
});

passport.use(
  new LocalStrategy({ usernameField: 'login', passwordField: 'psw' }, (login, password, done) => {
    let user = JSON.parse(fs.readFileSync('./users.json', 'utf-8'))[login];
    if (user !== undefined && user.psw === authModule.getHashedPassword(psw)) {
			return done(null, user);
		} else {
			return done(null, false, {
				message: "Email или пароль введены некорректно."
			});
		}
  })
);
