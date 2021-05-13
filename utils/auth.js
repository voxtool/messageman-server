const jwt = require('./jwt');
const config = require('../config/config');
const authCookieName = config.authCookieName;
const { User, Token } = require('../models');

function auth(redirectUnauthenticated = true) {

    return function (req, res, next) {
        const token = req.cookies[authCookieName] || '';
        Promise.all([
            jwt.verifyToken(token),
            Token.findOne({ token })
        ]).then(([data, blacklistedToken]) => {
            if (blacklistedToken) {
                return Promise.reject(new Error('blacklisted token'));
            }
            User.findById(data.id)
                .then(user => {
                    req.user = user;
                    next();
                })
        }).catch(err => {
            if (!redirectUnauthenticated) {
                next();
                return;
            }
            if (['token expired', 'blacklisted token', 'jwt must be provided'].includes(err.message)) {
                console.error(err);
                res.status(401).send({ message: "Invalid token!" });
                return;
            }
            next(err);
        });
    }
}

module.exports = auth;