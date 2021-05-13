const express = require('express');
const router = express.Router();
const users = require('./users');
const conversations = require('./conversations');

router.use('/users', users);
router.use('/conversations', conversations);

module.exports = router;