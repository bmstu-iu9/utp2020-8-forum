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
    let post = db.prepare(SQLrequests.checkPostExists).get(title, category_id);
    return post !== undefined
}

const addNewPost = (db, author_id, title, category_id) => {
    if (!checkPostExists(db, title, category_id)) {
        db.prepare(SQLrequests.addPost).run(author_id, title, category_id);
        return true
    }
    return false
}

const addReply = (db, author_id, reply, post_id) => {
    db.prepare(SQLrequests.addReply).run(author_id, reply, post_id);
}

const findUser = (data, login) => {
    return data.prepare(SQLrequests.findUser).get(login);
}

exports.checkUserExists = (data, login) => {
    let usr = findUser(data, login);
    return usr !== undefined;
}


exports.createUser = (data, login, psswrd) => {
    data.prepare(SQLrequests.createUser).run(login, psswrd);
}


const getRepliesCount = (db) => {
    return db.prepare(SQLrequests.getRepliesCount).all();
}

exports.init = init;
exports.migrate = migrate;
exports.getAllPosts = getAllPosts;
exports.getPost = getPost;
exports.getReplies = getReplies;
exports.getPostsByCategory = getPostsByCategory;
exports.getCategories = getCategories;
exports.addPost = addNewPost;
exports.checkPostExists = checkPostExists;
exports.addReply = addReply;
exports.getRepliesCount = getRepliesCount;
exports.findUser = findUser;
