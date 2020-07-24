const dbManager = require('../modules/db');
const express = require('express'),
    router = express.Router();


const sortPosts = (posts, sortTag) => {
    switch (sortTag) {
        case 'byTimeAsc':
            return posts = posts.reverse();
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

router.get('/all', (req, res) => {
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
        userPostsChosen: false,
        sortTag: sortTag,
        user: req.user,
        message: req.flash('error')
    });
})

router.get('/:categoryId(\\d+)', (req, res) => {
    let categories = dbManager.getCategories();
    let categoryId = req.params.categoryId.trim();
    let sortTag = req.query.sortTag;
    if (categories.length >= categoryId) {
        let posts = dbManager.getPostsByCategory(categoryId).reverse();
        posts = sortPosts(posts, sortTag);
        res.render('home', {
            layout: 'postsListViewLayout',
            posts: posts,
            categories: categories,
            postsListTitle: categories[categoryId - 1].name,
            postFail: req.query.postFail,
            categoryChosen: true,
            userPostsChosen: false,
            sortTag: sortTag,
            user: req.user
        });
    } else
        res.status(404).send('Нет такой категории');
})

router.post('/:categoryId(\\d+)', function (req, res) {
    let categoryId = req.params.categoryId;
    let categories = dbManager.getCategories();
    if (categories.length >= categoryId) {
        let postSuccess = dbManager.addPost(req.user.id, req.body.myPost.trim(), categoryId);
        if (postSuccess)
            res.redirect(`/category/${categoryId}`)
        else res.redirect(`/category/${categoryId}?postFail=true`)

    } else res.redirect(`/category/${categoryId}?postFail=true`)
})

router.post('/create', (req, res) => {
    let category = dbManager.checkCategoryExists(req.body.category.trim());
    let categoryId = dbManager.getCategories().length;
    if (!category) {
        dbManager.createCategory(req.body.category.trim());
        categoryId++;
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
        userPostsChosen: true,
        sortTag: sortTag,
        user: req.user
    });
});

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