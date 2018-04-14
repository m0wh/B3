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

  socket.on('addUser', (username, callback) => {
    const secureUsername = secureString(username);
    if (usernameIsValid(secureUsername)) {
      socket.username = secureUsername;
      socket.emit('newMessage', generateMessage('Admin', `Welcome to B3, ${socket.username}.`));
      socket.broadcast.emit('newMessage', generateMessage('Admin', `${socket.username} joined.`));
      callback(true);
    } else {
      callback(false);
    }
  });

  socket.on('createMessage', (message, callback) => {
    console.log('Create message', message);
    io.emit('newMessage', generateMessage(socket.username, message));
    callback();
  });


  socket.on('disconnect', () => {
    console.log(`(-) ${socket.id}`);
    socket.broadcast.emit('newMessage', generateMessage('Admin', `${socket.username} left.`));
  });

});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});


function secureString(str) {
  return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').trim();
}

function usernameIsValid(usrnm) {
  if(usrnm == "Admin" || usrnm == "" || usrnm == undefined) {
    return false;
  } else {
    return true;
  }
}
