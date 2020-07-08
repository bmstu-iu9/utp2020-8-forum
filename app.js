const express = require('express');
const exphbs  = require('express-handlebars');
const logger = require('./middleware/logger');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(logger); // Показывает в консоли запросы к серверу и время запроса
app.use('/static', express.static(path.join(__dirname, 'public'))); // Где находятся статик-файлы (скрипты, стили, картинки и т.п.



app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', function (req, res, next) {
    res.render('home', {layout: 'main', posts: ['post 1', 'post 2', 'post 3']});
});

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));