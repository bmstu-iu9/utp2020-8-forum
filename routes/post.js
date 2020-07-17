const dbManager = require('../modules/db');
const db = dbManager.init();
const express = require('express'),
    router = express.Router();

router.get('/:postId', function (req, res) {
    let categories = dbManager.getCategories(db);
    let postId = req.params.postId;
    let post = dbManager.getPost(db, postId);
    let replies = dbManager.getReplies(db, postId);
    res.render('home', {
        layout: 'postViewLayout',
        categories: categories,
        post: post,
        replies: replies,
        user: req.user
    });
});

router.post('/:postId', function (req, res) {
    let id = req.params.postId;
    dbManager.addReply(db, req.user.id, req.body.myAnswer, id);
    res.redirect(id)
});

module.exports = router;