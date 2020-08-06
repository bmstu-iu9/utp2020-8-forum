const dbManager = require('../modules/db');
const express = require('express'),
    router = express.Router();
const moment = require('moment');

router.get('/:postId(\\d+)', function (req, res) {
    let postId = req.params.postId;
    let from = req.query.from;
    let post = dbManager.getPost(postId)
    console.log(from)
    if (post) {
        let categories = dbManager.getCategories();
        let replies = dbManager.getReplies(postId)
        replies = dbManager.modifiedTimes(moment, replies);
        res.render('home', {
            layout: 'postViewLayout',
            categories: categories,
            category: {id: 0, name: 'Все'},
            post: post,
            replies: replies,
            user: req.user,
            from: from
        });
    } else res.status(404).send('Нет такого поста')

})

router.post('/:postId(\\d+)', function (req, res) {
    let id = req.params.postId;
    let date = new Date();
    let creation_time = date.toDateString() + " " + date.toTimeString();
    const originalUrl = req.originalUrl;
    dbManager.addReply(req.user.id, req.body.myAnswer, id, creation_time);
    res.redirect(originalUrl)
})

router.post('/delete', (req, res) => {
    let category = dbManager.getPost(req.body.id).category_id;
    dbManager.deletePost(req.body.id);
    let posts = dbManager.getPostsByCategory(category);
    if (posts.length === 0) {
        dbManager.deleteCategory(category);
    }
    res.status(200).send();
});


router.post('/edit', (req, res) => {
    if (!dbManager.checkPostExists(req.body.text.trim(), req.body.category)) {
        dbManager.updatePost(req.body.text.trim(), req.body.id);
        res.status(200).send();
    } else {
        res.status(400).send();
    }

});

module.exports = router;
