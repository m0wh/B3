const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users;

const admin = {
  username: 'Admin',
  id: 'administrator'
}
let rooms = [];

app.use(express.static(publicPath));



io.on('connection', (socket) => {
  console.log(`(+) ${socket.id}`);

  socket.on('addUser', (username, callback) => {
    const secureUsername = secureString(username);
    if (usernameIsValid(secureUsername)) {
      let room = lastRoom();
      socket.join(room);
      users.removeUser(socket.id);
      users.addUser(socket.id, secureUsername, room);
      io.to(room).emit('updateUserList', users.getUserList(room));
      callback(true);
    } else {
      callback(false);
    }
  });

  socket.on('createMessage', (message, callback) => {
    const secureMessage = secureString(message);
    let user = users.getUser(socket.id);
    if (messageIsValid(secureMessage)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, socket.id, message));
      callback();
    }
  });


  socket.on('disconnect', () => {
    console.log(`(-) ${socket.id}`);

    let user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
    }
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
  if (usrnm == "" || usrnm == undefined) {
    return false;
  } else {
    return true;
  }
}
function messageIsValid (msg) {
  if (msg == "" || msg == undefined) {
    return false;
  } else {
    return true;
  }
}
function generateString (len) {
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let string = "";
  for (let i = 0; i < len; i++) {
    string += char.charAt(Math.floor(Math.random() * char.length));
  }
  return string;
}
function lastRoom () {
  if ((users.users.length) % 3 == 0) { // si les salles (de trois personnes) sont pleines
    rooms.push('room_' + generateString(10)); // on crée une nouvelle salle
  }
  return rooms[rooms.length-1];
}
