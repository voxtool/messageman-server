const { Conversation } = require('../models');

async function getConversations(req, res, next) {
    const { _id: userId } = req.user;
    try {
        const conversations = await Conversation.find({ recipients: { $in: userId } }).sort({ created_at: -1 });
        res.status(200).json(conversations);
    } catch (err) {
        next(err);
    }
}


module.exports = {
    getConversations
}