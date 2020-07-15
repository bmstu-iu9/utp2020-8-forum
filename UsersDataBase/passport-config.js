'use strict'

const passport = require('passport');
const session = require('express-session');
const authModule = require('./auth.js');
const LocalStrategy = require('passport-local').Strategy;
const sqlite = require('./users.js');
const db = new require('better-sqlite3')('./UsersDataBase/users.db');

passport.serializeUser(function(user, done) {
  done(null, user.login);
});

passport.deserializeUser(function(login, done) {
	done(null, sqlite.findUser(db, login));
});

passport.use(
  new LocalStrategy({ usernameField: 'login', passwordField: 'psw' }, (login, password, done) => {
    let user = sqlite.findUser(db, login);
    if (user !== undefined && user.password === authModule.getHashedPassword(password)) {
			return done(null, user);
		} else {
			return done(null, false, {
				message: "Email или пароль введены некорректно."
			});
		}
  })
);