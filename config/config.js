const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../', 'example.env') });

const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        port: process.env.PORT || 5000,
        dbURL: process.env.DB_URL,
        cookieSecret: process.env.COOKIESECRET || 'BigSecret',
        authCookieName: process.env.COOKIENAME || 'messageman-id',
        origin: process.env.ORIGIN || 'http://localhost:3000'
    },
    production: {
        port: process.env.PORT || 5000,
        dbURL: process.env.DB_URL,
        cookieSecret: process.env.COOKIESECRET || 'BigSecret',
        authCookieName: process.env.COOKIENAME || 'messageman-id',
        origin: process.env.ORIGIN || 'http://localhost:3000'
    }
};

module.exports = config[env];