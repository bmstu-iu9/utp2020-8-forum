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
        message: req.flash('error')
    });
});

router.get('/:categoryId(\\d+)', function (req, res) {
    let categories = dbManager.getCategories();
    let categoryId = req.params.categoryId;
    let sortTag = req.query.sortTag;
    if (categories.length >= categoryId) {
        let posts = dbManager.getPostsByCategory(categoryId).reverse()
        posts = sortPosts(posts, sortTag);
        res.render('home', {
            layout: 'postsListViewLayout',
            posts: posts,
            categories: categories,
            postsListTitle: categories[categoryId - 1].name,
            postFail: req.query.postFail,
            categoryChosen: true,
            sortTag: sortTag,
            user: req.user
        });
    } else
        res.status(404).send('Нет такой категории')
})

router.post('/:categoryId(\\d+)', function (req, res) {
    let categoryId = req.params.categoryId;
    let categories = dbManager.getCategories();
    if (categories.length >= categoryId) {
        let postSuccess = dbManager.addPost(req.user.id, req.body.myPost, categoryId);
        if (postSuccess)
            res.redirect(`/category/${categoryId}`)
        else res.redirect(`/category/${categoryId}?postFail=true`)

    } else res.redirect(`/category/${categoryId}?postFail=true`)
})

module.exports = router;