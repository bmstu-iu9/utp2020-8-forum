const dbManager = require('../modules/db');
const express = require('express'),
    router = express.Router();
const moment = require('moment');
moment.locale('ru');

const sortPosts = (posts, sortTag) => {
    switch (sortTag) {
        case 'byTime':
            return posts.sort((a, b) => b.id - a.id);
        case 'byTimeAsc':
            return posts.sort((a, b) => a.id - b.id);
        case 'byReplies':
            return posts.sort((a, b) => b.reply_count - a.reply_count);
        case 'byRepliesAsc':
            return posts.sort((a, b) => a.reply_count - b.reply_count);
        case 'byLastReply':
            return posts.sort((a, b) => b.last_reply.id - a.last_reply.id);
        case 'byLastReplyAsc':
            return posts.sort((a, b) => a.last_reply.id - b.last_reply.id);
        default:
            return posts;
    }
}

router.get('/all', function (req, res) {
    let categories = dbManager.getCategories();
    let posts = dbManager.getAllPosts();
    let sortTag = req.query.sortTag || 'byTime';
    posts = sortPosts(posts, sortTag);
    posts = dbManager.modifiedTimes(moment, posts);
    res.render('home', {
        layout: 'postsListViewLayout',
        posts: posts,
        categories: categories,
        sortTag: sortTag,
        user: req.user,
        message: req.flash('error'),
        currentPath: req.originalUrl
    });
})


router.get('/:categoryId(\\d+)', (req, res) => {
    let categories = dbManager.getCategories();
    let categoryId = req.params.categoryId.trim();
    let category = dbManager.getCategoryById(categoryId);
    if (category !== undefined) {
        let sortTag = req.query.sortTag || "byTime";
        let posts = dbManager.getPostsByCategory(categoryId).reverse();
        posts = sortPosts(posts, sortTag);
        posts = dbManager.modifiedTimes(moment, posts);
        res.render('home', {
            layout: 'postsListViewLayout',
            posts: posts,
            categories: categories,
            category: category,
            postFail: req.query.postFail,
            sortTag: sortTag,
            user: req.user,
            currentPath: req.originalUrl
        });
    } else {
        res.status(404).send("Нет такой категории");
    }
})

router.post('/create', (req, res) => {
    if (req.user) {
        let category = dbManager.checkCategoryExists(req.body.newCategoryName.trim());
        if (!category) {
            dbManager.createCategory(req.body.newCategoryName.trim());
            let categoryId = dbManager.checkCategoryExists(req.body.newCategoryName.trim()).id;
            res.redirect(`/category/${categoryId}`);
        } else
            res.redirect(`/`);
    } else {
        req.flash('error', 'not auth action')
        res.redirect("/")
    }
});

router.post('/delete/:categoryId(\\d+)', (req, res) => {
    if (req.user) {
        let categoryId = req.params.categoryId;
        let category = dbManager.getCategoryById(categoryId)
        if (category) {
            dbManager.deleteCategory(categoryId)
            res.redirect('/')
        }
    } else {
        req.flash('error', 'not auth action')
        res.redirect("/")
    }

})

router.get('/myPosts', (req, res) => {
    let categories = dbManager.getCategories();
    let posts = dbManager.getPostsByUser(req.user.id);
    let sortTag = req.query.sortTag || "byTime";
    posts = sortPosts(posts, sortTag);
    posts = dbManager.modifiedTimes(moment, posts);
    res.render('home', {
        layout: 'postsListViewLayout',
        posts: posts,
        categories: categories,
        postFail: req.query.postFail,
        sortTag: sortTag,
        user: req.user,
        currentPath: req.originalUrl
    });
});

module.exports = router;
