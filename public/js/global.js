var client = new Faye.Client('/faye');
client.subscribe('/messages', function(html) {
  $('body').append(html);
});

client.subscribe('/clients', function(clients) {
  $('#text-clientCount').text(clients.count);
});


$('#submit').submit(function(e) {
  e.preventDefault();

  client.publish($(this).attr('action'), $('#message').val());
});