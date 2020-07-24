const dbManager = require('../modules/db');
const express = require('express'),
    router = express.Router();


router.get('/:postId(\\d+)', function (req, res) {
    let postId = req.params.postId;
    let from = req.query.from;
    let post = dbManager.getPost(postId)
    console.log(from)
    if (post) {
        let categories = dbManager.getCategories();
        let replies = dbManager.getReplies(postId)
        res.render('home', {
            layout: 'postViewLayout',
            categories: categories,
            post: post,
            replies: replies,
            user: req.user,
            from: from
        });
    } else res.status(404).send('Нет такого поста')

})

router.post('/:postId(\\d+)', function (req, res) {
    let id = req.params.postId;
    const originalUrl = req.originalUrl;
    dbManager.addReply(req.user.id, req.body.myAnswer, id);
    res.redirect(originalUrl)
})


module.exports = router;