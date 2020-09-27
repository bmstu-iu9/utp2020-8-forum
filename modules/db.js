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
        p.first_reply = getFirstReply(p.id);
    })
    return posts;
}
const getPostsByCategory = categoryId => {
    let posts = query("getPostsByCategory").all(categoryId, categoryId);
    posts.forEach(p => {
        let lastReply = getLastReply(p.id);
        p.last_reply = (lastReply ? lastReply : {"id": 0})
        p.first_reply = getFirstReply(p.id);
    })
    return posts;
}

const getPost = postId => query("getPost").get(postId, postId)

const getReply = replyId => query("getReply").get(replyId)

const getReplies = postId => query("getReplies").all(postId, postId)

const getFirstReply = postId => query("getFirstReply").get(postId);

const getLastReply = postId => query("getLastReply").get(postId);

const checkPostExists = (title, category_id) => query("checkPostExists").get(title, category_id) !== undefined

const addNewPost = (author_id, title, category_id, creation_time) => {
    if (checkPostExists(title, category_id))
        return false
    return query("addPost").run(author_id, title, category_id, creation_time);
}

const addReply = (author_id, reply, post_id, creation_time) => query("addReply").run(author_id, reply, post_id, creation_time);

const addVoteEntry = (user_id, reply_id, amount) => query("addVoteEntry").run(user_id, reply_id, amount)
const deleteVoteEntry = (id) => query("deleteVoteEntry").run(id)

const inverseVoteAmount = id => query("inverseVoteAmount").run(id);

const checkUserVoted = (user_id, reply_id) => query("checkUserVoted").get(user_id, reply_id)

const findUser = login => query("findUser").get(login);

const checkUserExists = login => findUser(login) !== undefined

const createUser = (login, psswrd) => query("createUser").run(login, psswrd);

const getRepliesCount = () => query("getReplyCount").all()

const deleteUser = user_id => query("deleteUser").run(user_id)

const checkCategoryExists = category => query("checkCategoryExists").get(category);

const getCategoryById = id => query("getCategoryById").get(id);

const createCategory = category => query("createCategory").run(category);

const getPostsByUser = userId => {
    let posts = query("getPostsByUser").all(userId, userId);
    posts.forEach(p => {
        let lastReply = getLastReply(p.id);
        p.last_reply = (lastReply ? lastReply : {"id": 0})
        p.first_reply = getFirstReply(p.id);
    })
    return posts;
}

const deletePost = postId => query("deletePost").run(postId);

const deleteCategory = categoryId => query("deleteCategory").run(categoryId);

const updatePost = (text, postId) => query("updatePost").run(text, postId);

const deleteReply = replyId => query("deleteReply").run(replyId);

const modifiedTimes = (moment, postsOrReplies) => {
    for (let i = 0; i < postsOrReplies.length; ++i)
        postsOrReplies[i].time_since_creation = moment(new Date(postsOrReplies[i].creation_time)).fromNow();
    return postsOrReplies;
}

const updateReply = (text, replyId) => query("updateReply").run(text, replyId);

exports.init = init;
exports.migrate = migrate;
exports.getAllPosts = getAllPosts;
exports.getPost = getPost;
exports.getReply = getReply;
exports.getReplies = getReplies;
exports.getFirstReply = getFirstReply;
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
exports.deleteVoteEntry = deleteVoteEntry;
exports.inverseVoteAmount = inverseVoteAmount;
exports.deleteUser = deleteUser;
exports.checkCategoryExists = checkCategoryExists;
exports.getCategoryById = getCategoryById;
exports.createCategory = createCategory;
exports.checkUserExists = checkUserExists;
exports.createUser = createUser;
exports.getPostsByUser = getPostsByUser;
exports.deletePost = deletePost;
exports.deleteCategory = deleteCategory;
exports.updatePost = updatePost;
exports.deleteReply = deleteReply;
exports.updateReply = updateReply;
exports.modifiedTimes = modifiedTimes;
