const Database = require('better-sqlite3')
const modelsJSON = require('../json/models.json')
const SQLrequests = require('../json/SQLrequests.json')

const models = modelsJSON.models;

const init = () => {
    return new Database('app.db');
}


/*Использует файл models.json для генерации базы данных с таблицами, соответсвующими описанным моделям.
* При выполнении БД форматируется*/
const migrate = () => {
    let db = new Database('app.db');
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

const getCategories = (db) => {
    return db.prepare(SQLrequests.getCategories).all();
}

const getAllPosts = (db) => {
    return db.prepare(SQLrequests.getAllPosts).all();
}
const getPostsByCategory = (db, categoryId) => {
    return db.prepare(SQLrequests.getPostsByCategory.replace("{id}", categoryId)).all();
}

const getPost = (db, postId) => {
    return db.prepare(SQLrequests.getPost.replace("{id}", postId)).get();
}

const getReplies = (db, postId) => {
    return db.prepare(SQLrequests.getReplies.replace("{id}", postId)).all();
}

const checkPostExists = (db, title, category_id) => {
    let post = db.prepare('SELECT * FROM posts WHERE trim(title)=? AND trim(category_id)=?').get(title, category_id);
    return post !== undefined
}

const addNewPost = (db, author_id, title, category_id) => {
    if (checkPostExists(db, title, category_id)){
        return false;
    } else{
        db.prepare('INSERT INTO posts (author_id, title, category_id) VALUES (?, ?, ?)').run(author_id, title, category_id);
        return true
    }
    return true
}

const addNewReply = (db, author_id, reply, post_id) => {
    db.prepare('INSERT INTO replies (author_id, text, post_id) VALUES (?, ?, ?)').run(author_id, reply, post_id);
}


exports.init = init;
exports.migrate = migrate;
exports.getAllPosts = getAllPosts;
exports.getPost = getPost;
exports.getReplies = getReplies;
exports.getPostsByCategory = getPostsByCategory;
exports.getCategories = getCategories;
exports.addNewPost = addNewPost;
exports.checkPostExists = checkPostExists;
exports.addNewReply = addNewReply;
