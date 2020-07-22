const dbManager = require('../modules/db');
const db = dbManager.init();
const express = require('express'),
    router = express.Router();


router.get('/:postId(\\d+)', function (req, res) {
    let postId = req.params.postId;
    let post = dbManager.getPost(db, postId)
    if (post) {
        let categories = dbManager.getCategories(db);
        let replies = dbManager.getReplies(db, postId)
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
    dbManager.addReply(db, req.user.id, req.body.myAnswer, id);
    res.redirect(`/post/${id}`)
})


module.exports = router;