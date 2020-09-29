const dbManager = require('../modules/db');
const express = require('express'),
    router = express.Router();
const moment = require('moment');
moment.locale('ru');

let jsonParser = express.json();

router.get('/:postId(\\d+)', function (req, res) {
    let postId = req.params.postId;
    let from = req.query.from;
    let post = dbManager.getPost(postId)
    if (post) {
        let categories = dbManager.getCategories();
        let category = dbManager.getCategoryById(post.category_id)
        let replies = dbManager.getReplies(postId)
        replies = dbManager.modifiedTimes(moment, replies);
        res.render('home', {
            layout: 'postViewLayout',
            categories: categories,
            category: category,
            post: post,
            replies: replies,
            user: req.user,
            from: from
        });
    } else res.status(404).send('Нет такого поста')

})

router.post('/create', (req, res) => {
    if (req.user) {
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
            let url = `/post/${result.lastInsertRowid}?from=/category/${categoryId}`;
            res.json(url);
            //res.redirect(`/post/${result.lastInsertRowid}?from=/category/${categoryId}`);
        }
        else {
            res.json('already exists');
        }
    } else {
        req.flash('error', 'not auth action')
        res.json("/")
    }

});

router.post('/:postId(\\d+)', function (req, res) {
    let id = req.params.postId;
    if (req.user) {
        let date = new Date();
        let creation_time = date.toDateString() + " " + date.toTimeString();
        const originalUrl = req.originalUrl;
        dbManager.addReply(req.user.id, req.body.myAnswer, id, creation_time);
        res.redirect(originalUrl)
    }
    else {
        req.flash('error', 'not auth action')
        res.redirect(`/`)
    }
})

router.post('/delete', (req, res) => {
    if (req.user) {
        dbManager.deletePost(req.body.id);
        if (posts.length === 0)
            res.redirect(`/category/${category_id}`)
        else
            res.status(200).send();
    }
    else {
       // req.flash('error', 'not auth action')
        res.redirect(`/`)
    }
});


router.post('/edit', (req, res) => {
    if (req.user) {
        if (!dbManager.checkPostExists(req.body.text.trim(), req.body.category)) {
            dbManager.updatePost(req.body.text.trim(), req.body.id);
            res.status(200).send();
        } else {
            res.status(400).send();
        }
    } else {
       // req.flash('error', 'not auth action')
        res.redirect(`/`)
    }

});

module.exports = router;
