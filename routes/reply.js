const dbManager = require('../modules/db');
const db = dbManager.init();
const express = require('express'),
    router = express.Router();


router.post('/vote/:replyId(\\d+)/:amount', function (req, res) {
    let replyId = req.params.replyId;
    let amount = req.params.amount;
    let postId = dbManager.getReply(db, replyId).post_id;
    let userVoted = dbManager.checkUserVoted(db, req.user.id, replyId)
    if (userVoted && userVoted.amount * amount < 0)
        dbManager.inverseVoteAmount(db, userVoted.id)
    else if (!userVoted)
        dbManager.addVoteEntry(db, req.user.id, replyId, amount)
    res.redirect(`/post/${postId}#reply_${replyId}`)
})
module.exports = router;