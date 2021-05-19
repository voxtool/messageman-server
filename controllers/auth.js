const mongoose = require('mongoose');
const { User, Token } = require('../models');
const config = require('../config/config');
const authCookieName = config.authCookieName;
const utils = require('../utils');


async function register(req, res, next) {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) {
            res.status(409)
                .send({ message: 'The username is already registered!' });
            return
        }
        let newUser = await User.create({ username, password });
        const token = utils.jwt.createToken({ id: newUser._id });
        if (process.env.NODE_ENV === 'production') {
            res.cookie(authCookieName, token, { httpOnly: true, sameSite: 'none', secure: true });
        } else {
            res.cookie(authCookieName, token, { httpOnly: true });
        }
        res.status(200).send(newUser);
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            let field = err.message.split("index: ")[1];
            field = field.split(" dup key")[0];
            field = field.substring(0, field.lastIndexOf("_"));

            res.status(409)
                .send({ message: `This ${field} is already registered!` });
            return;
        }
        next(err);
    }
}


async function login(req, res, next) {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username }).populate('contacts', { _id: 1, username: 1 });
        if (!user) {
            res.status(401)
                .send({ message: 'Wrong username or password' });
            return
        }
        const match = await user.matchPassword(password);
        if (!match) {
            res.status(401)
                .send({ message: 'Wrong username or password' });
            return
        }
        const token = utils.jwt.createToken({ id: user._id });
        if (process.env.NODE_ENV === 'production') {
            res.cookie(authCookieName, token, { httpOnly: true, sameSite: 'none', secure: true });
        } else {
            res.cookie(authCookieName, token, { httpOnly: true });
        }
        res.status(200).send(user);
    } catch (err) {
        next(err);
    }
}


async function logout(req, res) {
    const token = req.cookies[authCookieName];
    try {
        const blackListToken = await Token.create({ token });
        res.clearCookie(authCookieName).status(200).send({ message: 'Logged out!' });
    } catch (error) {
        res.send(err);
    }
}


async function getProfileInfo(req, res, next) {
    const { _id: userId } = req.user;
    try {
        const user = await User.findOne({ _id: userId }).select(['_id', 'username', 'contacts']).populate('contacts', { _id: 1, username: 1 });
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}

async function findUser(req, res, next) {
    const query = req.params.query;
    if (mongoose.Types.ObjectId.isValid(query)) {
        try {
            const user = await User.find({ _id: query }).select(['_id', 'username']);
            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    } else {
        try {
            const user = await User.find({ username: query }).select(['_id', 'username']);
            res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }
}

async function addContact(req, res, next) {
    const contact = req.params.contact;
    const { _id: userId } = req.user;
    try {
        const user = await User.findByIdAndUpdate({ _id: userId }, { $addToSet: { contacts: contact } }, { new: true }).select(['_id', 'username', 'contacts']).populate('contacts', { _id: 1, username: 1 });
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}

async function removeContact(req, res, next) {
    const contact = req.params.contact;
    const { _id: userId } = req.user;
    try {
        const user = await User.findByIdAndUpdate({ _id: userId }, { $pull: { contacts: contact } }, { new: true }).select(['_id', 'username', 'contacts']).populate('contacts', { _id: 1, username: 1 });
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}


module.exports = {
    login,
    register,
    logout,
    getProfileInfo,
    findUser,
    addContact,
    removeContact
}