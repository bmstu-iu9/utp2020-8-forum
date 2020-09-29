const dbManager = require('../modules/db');
const express = require('express'),
    router = express.Router();

const passport = require('passport');
const authModule = require('../modules/hash-password.js');

router.post('/signup', (req, res) => {
    const { login, psw, pswConf } = req.body;
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

router.get('/status', (req, res) => {
    if (req.isAuthenticated())
        res.send('you are logged in');
    else
        res.send('you are not log in');
});


router.get('/deleteProfile', (req, res) => {
    if (req.user) {
        let id = req.user.id;
        req.logout()
        dbManager.deleteUser(id)
        res.redirect('/')
    }
    else {
        req.flash('error', 'not auth action')
        res.redirect("/")
    }
})

module.exports = router;
