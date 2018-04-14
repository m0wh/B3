var socket = io();
var username;

socket.on('connect', function() {
  console.log('Connected to server');
});

$('#connection-form').on('submit', function(e) {
  e.preventDefault();
  username = $('[name=username]').val();
  socket.emit('addUser', username, function(validUsername) {
    if(validUsername) {
      $('body').removeClass('disconnected');
    } else {
      $('#error').text("Error : not a valid name.").show(0).delay(3000).hide(0);
    }
  });
});

socket.on('newMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('hh:mm');
  var template = $('#message-template').html();
  if(message.from == 'Admin') {
    template = $('#message-admin-template').html();
  } else if (message.from == username) {
    template = $('#message-sent-template').html();
  }
  var html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: formattedTime
  });

  $('#messages').append(html);

  $("#messages").scrollTop($("#messages")[0].scrollHeight);
});


$('#message-form').on('submit', function(e) {
  e.preventDefault();

  var messageInput = $('[name=message]').val();

  socket.emit('createMessage', messageInput, function(data) {
    $('[name=message]').val("");
  });
});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

resizeChat();
$(window).resize(function() {
  resizeChat();
});

function resizeChat() {
  $('#messages').height(window.innerHeight-150);
}
