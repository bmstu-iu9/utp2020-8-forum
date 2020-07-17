'use strict'

const passport = require('passport');
const session = require('express-session');
const authModule = require('./auth.js');
const LocalStrategy = require('passport-local').Strategy;
const dbManager = require('./db.js');
const db = new require('better-sqlite3')('./app.db');

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((login, done) => {
	done(null, dbManager.findUser(db, login));
});

passport.use(
  new LocalStrategy({ usernameField: 'login', passwordField: 'psw', passReqToCallback: true }, (req, login, password, done) => {
    let user = dbManager.findUser(db, login);
    if (user !== undefined && user.password === authModule.getHashedPassword(password)) {
			return done(null, user);
		} else {
			return done(null, false, req.flash('error', 'Wrong login or password'));
		}
  })
);
