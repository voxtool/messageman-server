const express = require('express');
const router = express.Router();
const { auth } = require('../utils');
const { conversationController } = require('../controllers');

router.get('/all', auth(), conversationController.getConversations);

module.exports = router;