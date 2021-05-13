const config = require('./config/config');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const api = require('./router');
const { Conversation } = require('./models');

(async function () {
    try {
        await mongoose.connect(config.dbURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('Database is up and running...');

        const app = express();
        app.use(express.json());
        app.use(cookieParser(config.cookieSecret));
        app.use(cors({ origin: config.origin, credentials: true }));
        app.use('/', api);
        const server = http.createServer(app);
        const io = socketio(server, {
            cors: {
                origin: config.origin,
                methods: ["GET", "POST"]
            }
        });

        io.on('connection', socket => {
            const id = socket.handshake.query.id;
            socket.join(id);
            socket.on('send-message', async ({ recipients, message, conversationId }) => {
                try {
                    await Conversation.updateOne({ _id: conversationId }, { $push: { messages: message } });
                    recipients.forEach(recipient => {
                        //socket.broadcast.to(recipient).emit('receive-message');
                        io.in(recipient).emit('receive-message', { message, conversationId });
                    });
                } catch (err) {
                    console.log(err);
                }
            })
            socket.on('create-conversation', async (recipients) => {
                try {
                    const conversation = await Conversation.create({ recipients });
                    recipients.forEach(recipient => {
                        io.in(recipient).emit('new-conversation', conversation);
                    })
                } catch (err) {
                    console.log(err);
                }
            })
        })

        server.listen(config.port, console.log(`Listening on port ${config.port}...`));
    } catch (error) {
        console.error(error);
    };
})();