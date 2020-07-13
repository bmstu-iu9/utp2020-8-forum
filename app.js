const express = require('express');
const exphbs = require('express-handlebars');
const logger = require('./modules/logger');
const dbManager = require('./modules/db');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(logger); // Показывает в консоли запросы к серверу и время запроса
app.use('/static', express.static(path.join(__dirname, '/public')))

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


const db = dbManager.init();

app.get('/', function (req, res) {
    let categories = dbManager.getCategories(db);
    let posts = dbManager.getAllPosts(db)
    res.render('home', {layout: 'postsListViewLayout', posts: posts, categories: categories, postsListTitle: 'Все посты'});
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
    let posts = dbManager.getPostsByCategory(db, id)
    res.render('home', {layout: 'postsListViewLayout', posts: posts, categories: categories, postsListTitle: categories[id-1].name});
})


app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));