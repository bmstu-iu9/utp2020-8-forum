const dbManager = require('../modules/db');
const express = require('express'),
    router = express.Router();

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
    let sortTag = req.query.sortTag;
    posts = sortPosts(posts, sortTag);
    res.render('home', {
        layout: 'postsListViewLayout',
        posts: posts,
        categories: categories,
        postsListTitle: "Все посты",
        categoryChosen: false,
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
        let sortTag = req.query.sortTag;
        let posts = dbManager.getPostsByCategory(categoryId).reverse();
        posts = sortPosts(posts, sortTag);
        res.render('home', {
            layout: 'postsListViewLayout',
            posts: posts,
            categories: categories,
            postsListTitle: category.name,
            postFail: req.query.postFail,
            categoryChosen: true,
            sortTag: sortTag,
            user: req.user,
            currentPath: req.originalUrl
        });
    } else {
        res.status(404).send("Нет такой категории");
    }
})

router.post('/:categoryId(\\d+)', function (req, res) {
    let categoryId = req.params.categoryId;
    let categories = dbManager.getCategories();
    let originalUrl = req.originalUrl
    let category = dbManager.getCategoryById(categoryId);
    if (category !== undefined) {
        let postSuccess = dbManager.addPost(req.user.id, req.body.myPost, categoryId);
        if (postSuccess)
            res.redirect(originalUrl)
        else res.redirect(`${originalUrl}?postFail=true`)

    } else res.redirect(`${originalUrl}?postFail=true`)
})

router.post('/create', (req, res) => {
    let category = dbManager.checkCategoryExists(req.body.category.trim());
    let categoryId;
    if (!category) {
        dbManager.createCategory(req.body.category.trim());
        categoryId = dbManager.checkCategoryExists(req.body.category.trim()).id;
        dbManager.addPost(req.user.id, req.body.newPost.trim(), categoryId);
        res.redirect(`/category/${categoryId}`);
    } else {
        categoryId = category.id;
        let postSuccess = dbManager.addPost(req.user.id, req.body.newPost.trim(), categoryId);
        if (postSuccess)
            res.redirect(`/category/${categoryId}`);
        else
            res.redirect(`/category/${categoryId}?postFail=true`);
    }
});

router.get('/myPosts', (req, res) => {
    let categories = dbManager.getCategories();
    let posts = dbManager.getPostsByUser(req.user.id);
    let sortTag = req.query.sortTag;
    posts = sortPosts(posts, sortTag);
    res.render('home', {
        layout: 'postsListViewLayout',
        posts: posts,
        categories: categories,
        postsListTitle: "Мои посты",
        postFail: req.query.postFail,
        categoryChosen: false,
        sortTag: sortTag,
        user: req.user
    });
});

module.exports = router;
