const dbManager = require('../modules/db');
const express = require('express'),
    router = express.Router();


router.post('/vote/:replyId(\\d+)/:amount', function (req, res) {
    if (req.user) {
        let replyId = req.params.replyId;
        let amount = req.params.amount;
        let from = req.query.from;
        let postId = dbManager.getReply(replyId).post_id;
        let userVoted = dbManager.checkUserVoted(req.user.id, replyId)
        if (userVoted) {
            if (userVoted.amount * amount < 0)
                dbManager.inverseVoteAmount(userVoted.id)
            else
                dbManager.deleteVoteEntry(userVoted.id)
        } else
            dbManager.addVoteEntry(req.user.id, replyId, amount)
        res.redirect(`/post/${postId}?from=${from}#reply_${replyId}`)
    }
    else {
        req.flash('error', 'not auth action')
        res.redirect(`/`)
    }
})

router.post('/delete', (req, res) => {
    if (req.user) {
        dbManager.deleteReply(req.body.id);
        res.status(200).send();
    }
    else {
        req.flash('error', 'not auth action')
        res.redirect(`/`)
    }
});

router.post('/edit', (req, res) => {
    if (req.user) {
        console.log(req.body.text.trim());
        dbManager.updateReply(req.body.text.trim(), req.body.id);
        res.status(200).send();
    }
    else {
        req.flash('error', 'not auth action')
        res.json("/")
    }
});

module.exports = router;