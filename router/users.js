const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { auth } = require('../utils');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', auth() , authController.logout);
router.get('/search/:query', auth(), authController.findUser);
router.get('/profile', auth(), authController.getProfileInfo);
router.get('/add/:contact', auth(), authController.addContact);
router.get('/remove/:contact', auth(), authController.removeContact);

module.exports = router;