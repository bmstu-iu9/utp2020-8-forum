const dbManager = require('../modules/db');
const express = require('express'),
    router = express.Router();


router.get('/:postId(\\d+)', function (req, res) {
    let postId = req.params.postId;
    let post = dbManager.getPost(postId)
    if (post) {
        let categories = dbManager.getCategories();
        let replies = dbManager.getReplies(postId)
        res.render('home', {
            layout: 'postViewLayout',
            categories: categories,
            post: post,
            replies: replies,
            user: req.user
        });
    } else res.status(404).send('Нет такого поста')

})

router.post('/:postId(\\d+)', function (req, res) {
    let id = req.params.postId;
    dbManager.addReply(req.user.id, req.body.myAnswer, id);
    res.redirect(`/post/${id}`)
})

router.post('/delete', (req, res) => {
    let category = dbManager.getPost(req.body.id).category_id;
    dbManager.deletePost(req.body.id);
    let posts = dbManager.getPostsByCategory(category);
    if (posts.length === 0) {
        dbManager.deleteCategory(category);
    }
    res.status(200).send();
});

router.post('/edit', (req, res) => {
    if (!dbManager.checkPostExists(req.body.text.trim(), req.body.category)) {
        dbManager.updatePost(req.body.text.trim(), req.body.id);
        res.status(200).send();
    } else {
        res.status(400).send();
    }

});


module.exports = router;