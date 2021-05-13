const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        text: String
    }],
}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model('Conversation', ConversationSchema);