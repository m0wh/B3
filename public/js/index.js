var socket = io();
var username;
var id;

var linkDetectionRegex = new RegExp('((https?|ftp|ftps)\:\/\/)?[a-zA-Z0-9\-\.]+\.([a-z]{1,4}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal|fr|es|org)((\/|\:)\S*)?');

socket.on('connect', function() {
  id = socket.id;
});

$('#connection-form').on('submit', function(e) {
  e.preventDefault();
  username = $('[name=username]').val().trim();
  socket.emit('addUser', username, function(validUsername) {
    if(validUsername) {
      $('body').removeClass('disconnected');
    } else {
      $('#error').text("Error : not a valid name.").show(0).delay(3000).hide(0);
    }
  });
});

socket.on('newMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('LT');
  var template = $('#message-template').html();
  if(message.fromId == 'administrator') {
    template = $('#message-admin-template').html();
  } else if (message.fromId == id) {
    template = $('#message-sent-template').html();
  }
  var html = Mustache.render(template, {
    from: message.from,
    text: advancedText(message.text),
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

$('[name=disconnect]').click(function() {
  socket.disconnect();
  $('body').addClass('disconnected');
  socket = io();
});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

socket.on('updateUserList', function (users) {
  for (let u = 0; u < 3; u++) {
    if (users[u]) {
      $('#people>li').eq(u).text(users[u]).removeClass('empty');
    } else {
      $('#people>li').eq(u).text('Empty').addClass('empty');
    }
  }
});



/*
  FRONT END
*/

resizeChat();
$(window).resize(function() {
  resizeChat();
});

function resizeChat() {
  $('#messages').height(window.innerHeight-200);
}

function advancedText(text) {
  return text.replace(linkDetectionRegex, function(url) {
    var address;
    address = /[a-z]+:\/\//.test(url) ? url : "http://" + url;
    url = url.replace(/^https?:\/\//, '');
    console.log(url, adress);
    return "<a href='" + address + "' target='_blank'>" + url + "</a>";
  });
}
 
