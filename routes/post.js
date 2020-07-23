const dbManager = require('../modules/db');
const express = require('express'),
    router = express.Router();
const moment = require('moment');

router.get('/:postId(\\d+)', function (req, res) {
    let postId = req.params.postId;
    let post = dbManager.getPost(postId)
    if (post) {
        let categories = dbManager.getCategories();
        let replies = dbManager.getReplies(postId)
        replies = dbManager.modifiedTimes(moment, replies);
        res.render('home', {
            layout: 'postViewLayout',
            categories: categories,
            post: post,
            replies: replies,
            user: req.user
        });
    } else res.status(404).send('Нет такого поста')

})

router.post('/:postId(\\d+)', function (req, res) {
    let id = req.params.postId;
    let date = new Date();
    let creation_time = date.toDateString() + " " + date.toTimeString();
    dbManager.addReply(req.user.id, req.body.myAnswer, id, creation_time);
    res.redirect(`/post/${id}`)
})


module.exports = router;