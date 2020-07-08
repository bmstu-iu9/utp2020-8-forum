const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(logger); // Показывает в консоли запросы к серверу и время запроса
app.use(express.static(path.join(__dirname, 'public'))); // Где находятся статик-файлы (скрипты, стили, картинки и т.п.

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));