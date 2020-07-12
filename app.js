const express = require('express');
const exphbs = require('express-handlebars');
const logger = require('./modules/logger');
const dbManager = require('./modules/db');
const path = require('path');
const app = express();
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({extended: false})
const PORT = process.env.PORT || 8080;

app.use(logger); // Показывает в консоли запросы к серверу и время запроса
app.use('/static', express.static(path.join(__dirname, 'public'))); // Где находятся статик-файлы (скрипты, стили, картинки и т.п.)

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const db = dbManager.init();

dbManager.checkPostExists = (data, title) =>{
    let post = data.prepare('select * from posts trim(title) =?').get(title)
    return post !== undefined
}

dbManager.createPost = (data, author_id, title, category_id) =>{
    if(checkPostExists(data, title)){
        return false
    } else{
        data.prepare('INSERT INTO posts (author_name, title, category_name) VALUE (?, ?, ?)').run(author_id, title, category_id);
        return true
    }
    return false
}

db.prepare('insert into categories (name) value (?)').run('SPORT');

let category = db.prepare('SELECT * FORUM categories trim(name) =?').get('SPORT')
console.log(category.name);




app.get("/", (request, response) =>{
    response.render('home', {
        layout: 'main',
        categories: dbManager.getCategories(db)
    }); 
});

app.get("/category/:categoryId", (request, response) =>{
    let categories = dbManager.getCategories(db);
    let id = req.params.categoryId;
    let posts = dbManager.getPostsByCategory(db, id)
    response.render('home', {
        layout: 'postListViewLayout',
        posts: posts,
        categories: categories
    });
});

app.get('/post/:postId', (request, response) =>{
    let id = req.params.postId;
    let categories = dbManager(db)
    let post = dbManager.getPost(db, id)
    let replies = dbManager.getReplies(db, id)
    response.render('home', {
        layout: 'postViewLayout',
        post: post,
        replies: replies,
        categories: categories
    });
});

app.post('/category/:categoryId', urlencodedParser, (request, response) => {
    //if(!request.body)
    if (request.body.question == '') {
        let categories = dbManager.getCategories(db);
        let id = req.params.categoryId;
        let posts = dbManager.getPostsByCategory(db, id)
        response.render('home', {
            layout: 'NullPost',
            posts: posts,
            categories: categories
        });
    } else {
        if(!dbManager.checkPostExists(db, request.body.question)){
            response.render('home', {
                layout: 'existPost',
                posts: posts,
                categories: categories
            })
        }
        dbManager.createPost(db, 'Максуд', request.body.question, request.param.categoryId)
        let categories = dbManager.getCategories(db);
        let id = req.params.categoryId;
        let posts = dbManager.getPostsByCategory(db, id)
        response.render('home', {
            layout: 'postListViewLayout',
            posts: posts,
            categories: categories
        });
    }
});

app.post('/post/:postId', urlencodedParser, (request, response) =>{
    let id = req.params.postId;
    let post = dbManager.getPost(db, id)
    let replies = dbManager.getReplies(db, id)
    if(request.body.answer == ''){
        response.render('home', {
            layout: 'NullAnswer',
            post: post,
            replies: replies
        });
    } else {
        //push new Answer
        response.render('home', {
            layout: 'postViewLayout',
            post: post,
            replies: replies
        });
    }
});

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));