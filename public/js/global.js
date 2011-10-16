$(document).bind('ready', function() {
  app.faye = {
    client: new Faye.Client('/faye')
  };

  app.faye.client.addExtension({ outgoing: function(message, callback) {
   if (!message.ext) message.ext = {};

    message.ext.clientId = app.clientId;
    callback(message);
  }});

  app.faye.client.subscribe('/messages', function(messages) {
    $('#tpl-iframe').tmpl(messages).appendTo('#messages');

    $('#text-messageCount').text(messages.count);
  });

  app.faye.client.subscribe('/clients', function(clients) {
    var $clients = $('#clients');

    $clients.empty();

    for (i in clients) {
      $('#tpl-client').tmpl(clients[i]).appendTo($clients);
    }

    $('#text-clientCount').text(clients.length);
  });


  $('#form-sendMessage').submit(function(e) {
    e.preventDefault();

    app.faye.client.publish($(this).attr('action'), $('#input-message').val());
  });

  $('#form-setName').submit(function(e) {
    e.preventDefault();

    app.faye.client.publish(
      $(this).attr('action'),
      {
        clientId: app.clientId,
        name:     $('#input-name').val(),
        email:    $('#input-email').val()
      }
    );
  });

  var $mouseFollower  = $('#mouseFollower'),
      outerWidth      = $mouseFollower.outerWidth(),
      outerHeight     = $mouseFollower.outerHeight();

  $mouseFollower.show();

  $('#messages')
    .bind('mousemove', function(e) {
      $mouseFollower.css({
        left: e.clientX - (outerWidth / 2),
        top:  e.clientY - (outerHeight / 2)
      });
    })
    .bind('mouseleave', function(e) {
      $mouseFollower.hide();
    })
    .bind('mouseenter', function(e) {
      $mouseFollower.show();
    })
    .contextMenu(
      { menu: 'contextMenu' },
      function(action, el, pos) {
        alert(
            'Action: ' + action + '\n\n' +
            'Element ID: ' + $(el).attr('id') + '\n\n' +
            'X: ' + pos.x + '  Y: ' + pos.y + ' (relative to element)\n\n' +
            'X: ' + pos.docX + '  Y: ' + pos.docY+ ' (relative to document)'
            );
      }
    );
});