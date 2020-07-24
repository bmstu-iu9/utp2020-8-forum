const dbManager = require('../modules/db');
const express = require('express'),
    router = express.Router();


router.post('/vote/:replyId(\\d+)/:amount', function (req, res) {
    let replyId = req.params.replyId;
    let amount = req.params.amount;
    let postId = dbManager.getReply(replyId).post_id;
    let userVoted = dbManager.checkUserVoted(req.user.id, replyId)
    if (userVoted && userVoted.amount * amount < 0)
        dbManager.inverseVoteAmount(userVoted.id)
    else if (!userVoted)
        dbManager.addVoteEntry(req.user.id, replyId, amount)
    res.redirect(`/post/${postId}#reply_${replyId}`)
})

router.post('/delete', (req, res) => {
    dbManager.deleteReply(req.body.id);
    res.status(200).send();
});

router.post('/edit', (req, res) => {
    console.log(req.body.text.trim());
    dbManager.updateReply(req.body.text.trim(), req.body.id);
    res.status(200).send();
});

module.exports = router;