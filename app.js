const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const authModule = require('./modules/auth.js');
const logger = require('./modules/logger');
const dbManager = require('./modules/db');
const path = require('path');
const flash = require('connect-flash');
const app = express();
const PORT = process.env.PORT || 8080;
app.use(logger); // Показывает в консоли запросы к серверу и время запроса
app.use('/static', express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash());

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(
  session({
    secret: 'thatisasecret',
    store: new FileStore(),
    cookie: {
    	path: '/',
    	httpOnly: true,
    	maxAge: 60 * 60 * 1000,
    },
    resave: false,
    saveUninitialized: false,
  })
);

const db = dbManager.init();

require('./modules/passport-config.js');
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
    let categories = dbManager.getCategories(db);
    let posts = dbManager.getAllPosts(db);
    res.render('home', {
        layout: 'postsListViewLayout',
        posts: posts,
        categories: categories,
        postsListTitle: 'Все посты',
        message: req.flash('error')
    });
});

//dbManager.migrate();

app.post('/signup', (req, res) => {
  const { login, psw, pswConf } = req.body;
    if (psw === pswConf) {
      if (dbManager.checkUserExists(db, login)) {
        req.flash('error', 'User exists');
        res.redirect('/');
        console.log('User exists');
      } else {
        const hashedPassword = authModule.getHashedPassword(psw);
        dbManager.createUser(db, login, hashedPassword);
        res.redirect('/');
        console.log("Success");
      }
    } else {
      req.flash('error', 'Passwords do not match');
      res.redirect('/');
      console.log('Passwords do not match');
    }
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/',
  failureFlash: true
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/status', (req, res) => {
	if (req.isAuthenticated()) {
		res.send('you are logged in');
	} else {
		res.send('you are not log in');
	}
});

app.get('/post/:postId', function (req, res) {
	let categories = dbManager.getCategories(db);
	let postId = req.params.postId;
	let post = dbManager.getPost(db, postId);
	let replies = dbManager.getReplies(db, postId);
	res.render('home', {layout: 'postViewLayout', categories: categories, post: post, replies: replies});
});

app.get('/category/:categoryId', function (req, res) {
	let categories = dbManager.getCategories(db);
	let id = req.params.categoryId;
	let posts = dbManager.getPostsByCategory(db, id);
	res.render('home', {
			layout: 'postsListViewLayout',
			posts: posts,
			categories: categories,
			postsListTitle: categories[id - 1].name
	});
});

app.post('/post/:postId', function (req, res) {
	let categories = dbManager.getCategories(db);
	let id = req.params.postId;
	let post = dbManager.getPost(db, id);
	dbManager.addReply(db, 1, req.body.myAnswer, id);
	let replies = dbManager.getReplies(db, id);
	res.render('home', {
		layout: 'postViewLayout',
		categories: categories,
		post: post,
		replies: replies
	});
});

app.post('/category/:categoryId', function (req, res) {
	let categories = dbManager.getCategories(db);
	let id = req.params.categoryId;
	let postSuccess = dbManager.addPost(db, 1, req.body.myPost, id);
	let posts = dbManager.getPostsByCategory(db, id);
	res.render('home', {
			layout: 'postsListViewLayout',
			categories: categories,
			posts: posts,
			postsListTitle: categories[id - 1].name,
			postSuccess: postSuccess
	});
});

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));
