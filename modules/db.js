const Database = require('better-sqlite3')
const modelsJSON = require('../json/models.json')
const SQLrequests = require('../json/SQLrequests.json')
const models = modelsJSON.models;
const init = () => new Database('app.db');
const db = init();

/*Использует файл models.json для генерации базы данных с таблицами, соответсвующими описанным моделям.
* При выполнении БД форматируется*/
const migrate = () => {
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

const query = queryName => db.prepare(SQLrequests[queryName].join(""))

const getCategories = () => query("getCategories").all();

const getAllPosts = () => {
    let posts = query("getAllPosts").all();
    posts.forEach(p => {
        let lastReply = getLastReply(p.id);
        p.last_reply = (lastReply ? lastReply : {"id": 0})
    })
    return posts;
}
const getPostsByCategory = categoryId => {
    let posts = query("getPostsByCategory").all(categoryId, categoryId);
    posts.forEach(p => {
        let lastReply = getLastReply(p.id);
        p.last_reply = (lastReply ? lastReply : {"id": 0})
    })
    return posts;
}

const getPost = postId => query("getPost").get(postId)

const getReply = replyId => query("getReply").get(replyId)

const getReplies = postId => query("getReplies").all(postId, postId)

const getLastReply = postId => query("getLastReply").get(postId);

const checkPostExists = (title, category_id) => query("checkPostExists").get(title, category_id) !== undefined

const addNewPost = (author_id, title, category_id) => {
    if (checkPostExists(title, category_id))
        return false
    query("addPost").run(author_id, title, category_id);
    return true
}

const addReply = (author_id, reply, post_id) => query("addReply").run(author_id, reply, post_id);

const addVoteEntry = (user_id, reply_id, amount) => query("addVoteEntry").run(user_id, reply_id, amount)

const inverseVoteAmount = id => query("inverseVoteAmount").run(id);

const checkUserVoted = (user_id, reply_id) => query("checkUserVoted").get(user_id, reply_id)

const findUser = login => query("findUser").get(login);

const checkUserExists = login => findUser(login) !== undefined

const createUser = (login, psswrd) => query("createUser").run(login, psswrd);

const getRepliesCount = () => query("getReplyCount").all()

const deleteUser = user_id => query("deleteUser").run(user_id)

exports.migrate = migrate;
exports.getAllPosts = getAllPosts;
exports.getPost = getPost;
exports.getReply = getReply;
exports.getReplies = getReplies;
exports.getLastReply = getLastReply;
exports.getPostsByCategory = getPostsByCategory;
exports.getCategories = getCategories;
exports.addPost = addNewPost;
exports.checkPostExists = checkPostExists;
exports.addReply = addReply;
exports.getRepliesCount = getRepliesCount;
exports.findUser = findUser;
exports.checkUserVoted = checkUserVoted;
exports.addVoteEntry = addVoteEntry;
exports.inverseVoteAmount = inverseVoteAmount;
exports.deleteUser = deleteUser;
exports.checkUserExists = checkUserExists;
exports.createUser = createUser;