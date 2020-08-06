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
            post: post,
            replies: replies,
            user: req.user,
            from: from
        });
    } else res.status(404).send('Нет такого поста')

})

router.post('/create', (req, res) => {
    let categoryName = req.body.category.trim();
    let category = dbManager.checkCategoryExists(categoryName);
    let date = new Date();
    let creation_time = date.toDateString() + " " + date.toTimeString();
    let categoryId;
    if (!category) {
        let result = dbManager.createCategory(categoryName);
        categoryId = result.lastInsertRowid;
    }
    else
        categoryId = category.id
    let result = dbManager.addPost(req.user.id, req.body.postTitle.trim(), categoryId, creation_time);
    let postId = result.lastInsertRowid;
    if (result) {
        dbManager.addReply(req.user.id, req.body.postText.trim(), postId, creation_time)
        res.redirect(`/post/${result.lastInsertRowid}?from=/category/${categoryId}`);
    }
    else
        res.redirect(`/category/${categoryId}?postFail=true`);
});

router.post('/:postId(\\d+)', function (req, res) {
    let id = req.params.postId;
    let date = new Date();
    let creation_time = date.toDateString() + " " + date.toTimeString();
    const originalUrl = req.originalUrl;
    dbManager.addReply(req.user.id, req.body.myAnswer, id, creation_time);
    res.redirect(originalUrl)
})

router.post('/delete', (req, res) => {
    dbManager.deletePost(req.body.id);
    if (posts.length === 0)
        res.redirect('/category/${category_id}')
    else
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
