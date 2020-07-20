const dbManager = require('../modules/db');
const db = dbManager.init();
const express = require('express'),
    router = express.Router();

const passport = require('passport');
const authModule = require('../modules/auth.js');

router.post('/signup', (req, res) => {
    const {login, psw, pswConf} = req.body;
    if (psw === pswConf) {
        if (dbManager.checkUserExists(db, login)) {
            req.flash('error', 'User exists');
            res.redirect('/');
            console.log('User exists');
        } else {
            const hashedPassword = authModule.getHashedPassword(psw);
            dbManager.createUser(db, login, hashedPassword);
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

router.get('/status', (req, res) => {
    if (req.isAuthenticated())
        res.send('you are logged in');
    else
        res.send('you are not log in');
});


router.get('/deleteProfile', (req, res) => {
    let id = req.user.id;
    req.logout()
    dbManager.deleteUser(db, id)
    res.redirect('/')
})

module.exports = router;