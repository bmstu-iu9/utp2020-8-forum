const dbManager = require('../modules/db');
const db = dbManager.init();
const express = require('express'),
    router = express.Router();


router.get('/all', function (req, res) {
    let categories = dbManager.getCategories(db);
    let posts = dbManager.getAllPosts(db);
    res.render('home', {
        layout: 'postsListViewLayout',
        posts: posts,
        categories: categories,
        postsListTitle: 'Все посты',
        message: req.flash('error'),
        user: req.user
    });
});

router.get('/:categoryId', function (req, res) {
    let categories = dbManager.getCategories(db);
    let id = req.params.categoryId;
    let posts = dbManager.getPostsByCategory(db, id);
    res.render('home', {
        layout: 'postsListViewLayout',
        posts: posts,
        categories: categories,
        postsListTitle: categories[id - 1].name,
        user: req.user
    });
});
router.post('/:categoryId', function (req, res) {
    let id = req.params.categoryId;
    let postSuccess = dbManager.addPost(db, req.user.id, req.body.myAnswer, id);
    res.redirect(id)
});

module.exports = router;