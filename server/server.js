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
const admin = {
  username: 'Admin',
  id: 'administrator'
}

app.use(express.static(publicPath));



io.on('connection', (socket) => {
  console.log(`(+) ${socket.id}`);

  socket.on('addUser', (username, callback) => {
    const secureUsername = secureString(username);
    if (usernameIsValid(secureUsername)) {
      socket.username = secureUsername;
      socket.emit('newMessage', generateMessage(admin.username, admin.id, `Welcome to B3, ${socket.username}.`));
      socket.broadcast.emit('newMessage', generateMessage(admin.username, admin.id, `${socket.username} joined.`));
      callback(true);
    } else {
      callback(false);
    }
  });

  socket.on('joinRandomRoom', () => {

  });

  socket.on('createMessage', (message, callback) => {
    const secureMessage = secureString(message);
    if (messageIsValid(secureMessage)) {
      io.emit('newMessage', generateMessage(socket.username, socket.id, message));
      callback();
    }
  });


  socket.on('disconnect', () => {
    console.log(`(-) ${socket.id}`);
    socket.broadcast.emit('newMessage', generateMessage(admin.username, admin.id, `${socket.username} left.`));
  });

});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});





function secureString(str) {
  return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').trim();
  // avoid html injections
}
function usernameIsValid(usrnm) {
  if(usrnm == "" || usrnm == undefined) {
    return false;
  } else {
    return true;
  }
}
function messageIsValid(msg) {
  if(msg == "" || msg == undefined) {
    return false;
  } else {
    return true;
  }
}
