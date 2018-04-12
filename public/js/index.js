var socket = io();
var myUsername = 'Anonymous' + Math.round(Math.random()*9999);

socket.on('connect', function() {
  console.log('Connected to server');
});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

socket.on('newMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('hh:mm');
  var template = $('#message-template').html();
  if(message.from == 'Admin') {
    template = $('#message-admin-template').html();
  } else if (message.from == myUsername) {
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

  socket.emit('createMessage', {
    from: myUsername,
    text: messageInput
  }, function(data) {
    $('[name=message]').val("");
  });
});

resizeChat();
$(window).resize(function() {
  resizeChat();
});

function resizeChat() {
  $('#messages').height(window.innerHeight-150);
}


// moment.locale('fr');
// moment(1316116057189).fromNow();
