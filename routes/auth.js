const dbManager = require('../modules/db');
const express = require('express'),
    router = express.Router();

const passport = require('passport');
const authModule = require('../modules/auth.js');

router.post('/signup', (req, res) => {
    const {login, psw, pswConf} = req.body;
    if (psw === pswConf) {
        if (dbManager.checkUserExists(login)) {
            req.flash('error', 'User exists');
            res.redirect('/');
            console.log('User exists');
        } else {
            const hashedPassword = authModule.getHashedPassword(psw);
            dbManager.createUser(login, hashedPassword);
            res.redirect('/');
            console.log("Success");
        }
    } else {
        req.flash('error', 'Passwords do not match');
        res.redirect('/');
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true
}));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;