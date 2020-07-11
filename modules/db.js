const Database = require('better-sqlite3')
const modelsJSON = require('../json/models.json')
const SQLrequests = require('../json/SQLrequests.json')

const models = modelsJSON.models;

const init = () => {
    return new Database('app.db', {verbose: console.log});
}


/*Использует файл models.json для генерации базы данных с таблицами, соответсвующими описанным моделям.
* При выполнении БД форматируется*/
const migrate = (db) => {
    for (let i = 0; i < models.length; ++i) {
        let req = 'DROP TABLE IF EXISTS ' + models[i].tablename;
        db.prepare(req).run();
        req =
            'CREATE TABLE IF NOT EXISTS ' +
            models[i].tablename + '(';
        for (let j = 0; j < models[i].columns.length; ++j) {
            req += models[i].columns[j] + ' ' + models[i].tags[j];
            if (j < models[i].columns.length - 1)
                req += ','
        }
        req += ');'
        db.prepare(req).run();
    }
}

const getPosts = (db) => {
    let req = SQLrequests.getPosts;
    return db.prepare(req).all();
}


exports.init = init;
exports.migrate = migrate;
exports.getPosts = getPosts;