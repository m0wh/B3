const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage} = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log(`(+) ${socket.id}`);

  socket.emit('newMessage', generateMessage('Admin', 'Welcome to B3'));

  socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined'));

  socket.on('createMessage', (message, callback) => {
    console.log('Create message', message);
    io.emit('newMessage', generateMessage(message.from, message.text));
    callback();
  });


  socket.on('disconnect', () => {
    console.log(`(-) ${socket.id}`);
    socket.broadcast.emit('newMessage', generateMessage('Admin', 'A user left'));
  });

});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
