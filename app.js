const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const logger = require('./modules/logger');
const path = require('path');
const flash = require('connect-flash');
const app = express();
const PORT = process.env.PORT || 8080;
app.use(logger); // Показывает в консоли запросы к серверу и время запроса
app.use('/static', express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
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

require('./modules/passport-config.js');
app.use(passport.initialize());
app.use(passport.session());

let categoryRoutes = require('./routes/category')
let postRoutes = require('./routes/post')
let authRoutes = require('./routes/auth')
app.use('/category', categoryRoutes);
app.use('/post', postRoutes);
app.use('/', authRoutes);


app.get('/', function (req, res) {
    res.redirect('/category/all')
});


app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));
