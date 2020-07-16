const express = require('express');
const exphbs = require('express-handlebars');
const logger = require('./modules/logger');
const dbManager = require('./modules/db');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(logger);
app.use('/static', express.static(path.join(__dirname, '/public')))
app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const db = dbManager.init();

app.get('/', function (req, res) {
    let categories = dbManager.getCategories(db);
    let posts = dbManager.getAllPosts(db);
    let sortTag = req.query.sortTag;
    if (sortTag === 'byReplies')
        posts.sort((a, b) => b.reply_count - a.reply_count)
    res.render('home', {
        layout: 'postsListViewLayout',
        posts: posts,
        categories: categories,
        postsListTitle: "Все посты",
        categoryChosen: false,
    });
});

app.get('/category/:categoryId(\\d+)', function (req, res) {
    let categories = dbManager.getCategories(db);
    let categoryId = req.params.categoryId;
    let sortTag = req.query.sortTag;
    if (categories.length >= categoryId) {
        let posts = dbManager.getPostsByCategory(db, categoryId).reverse()
        if (sortTag === 'byReplies')
            posts.sort((a, b) => b.reply_count - a.reply_count)
        res.render('home', {
            layout: 'postsListViewLayout',
            posts: posts,
            categories: categories,
            postsListTitle: categories[categoryId - 1].name,
            postFail: req.query.postFail,
            categoryChosen: true
        });
    } else
        res.status(404).send('Нет такой категории')
})

app.get('/post/:postId(\\d+)', function (req, res) {
    let postId = req.params.postId;
    let post = dbManager.getPost(db, postId)
    if (post) {
        let categories = dbManager.getCategories(db);

        let replies = dbManager.getReplies(db, postId)
        res.render('home', {layout: 'postViewLayout', categories: categories, post: post, replies: replies});
    } else res.status(404).send('Нет такого поста')

})

app.post('/category/:categoryId(\\d+)', function (req, res) {
    let categoryId = req.params.categoryId;
    let categories = dbManager.getCategories(db);
    if (categories.length >= categoryId) {
        let postSuccess = dbManager.addPost(db, 1, req.body.myPost, categoryId);
        if (postSuccess)
            res.redirect(`/category/${categoryId}`)
        else res.redirect(`/category/${categoryId}?postFail=true`)

    } else res.redirect(`/category/${categoryId}?postFail=true`)
})

app.post('/post/:postId(\\d+)', function (req, res) {
    let id = req.params.postId;
    dbManager.addReply(db, 1, req.body.myAnswer, id);
    res.redirect(`/post/${id}`)
})


app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));