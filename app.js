const express = require('express');
const exphbs = require('express-handlebars');
const logger = require('./modules/logger');
const dbManager = require('./modules/db');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;
const urlencoded = bodyParser.urlencoded({extended: false});

app.use(logger);
app.use('/static', express.static(path.join(__dirname, '/public')))
app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const db = dbManager.init();

app.get('/', function (req, res) {
    let categories = dbManager.getCategories(db);
    let posts = dbManager.getAllPosts(db)
    let sortTag = req.query.sortTag;
    if (sortTag === 'byReplies')
        posts.sort((a, b) => {
            return b.reply_count - a.reply_count;
        })
    res.render('home', {
        layout: 'postsListViewLayout',
        posts: posts,
        categories: categories,
        postsListTitle: 'Все посты'
    });
});

app.get('/post/:postId', function (req, res) {
    let categories = dbManager.getCategories(db);
    let postId = req.params.postId;
    let post = dbManager.getPost(db, postId)
    let replies = dbManager.getReplies(db, postId)
    res.render('home', {layout: 'postViewLayout', categories: categories, post: post, replies: replies});
})

app.get('/category/:categoryId', function (req, res) {
    let categories = dbManager.getCategories(db);
    let id = req.params.categoryId;
    let sortTag = req.query.sortTag;

    let posts = dbManager.getPostsByCategory(db, id).reverse();
    if (sortTag === 'byReplies')
        posts.sort((a, b) => {
            return b.reply_count - a.reply_count;
        })
    res.render('home', {
        layout: 'postsListViewLayout',
        posts: posts,
        categories: categories,
        postsListTitle: categories[id - 1].name
    });
})

app.post('/post/:postId', function (req, res) {
    let categories = dbManager.getCategories(db);
    let id = req.params.postId;
    let post = dbManager.getPost(db, id)
    dbManager.addReply(db, 1, req.body.myAnswer, id);
    let replies = dbManager.getReplies(db, id);
    res.render('home', {layout: 'postViewLayout', categories: categories, post: post, replies: replies});
})

app.post('/category/:categoryId', function (req, res) {
    let categories = dbManager.getCategories(db);
    let id = req.params.categoryId;
    let postSuccess = dbManager.addPost(db, 1, req.body.myPost, id);
    let posts = dbManager.getPostsByCategory(db, id).reverse()
    res.render('home', {
        layout: 'postsListViewLayout',
        categories: categories,
        posts: posts,
        postsListTitle: categories[id - 1].name,
        postSuccess: postSuccess
    })
})
app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));