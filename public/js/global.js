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

  var $mouseFollower  = $('#mouseFollower');

  $mouseFollower.show();

  $('#messages')
    .bind('mousemove', function(e) {
      $mouseFollower.css({
        left: e.clientX,
        top:  e.clientY
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
        $('#form-sendMessage')
          .css({
            left: pos.docX,
            top:  pos.docY
          })
          .show();

        $('#input-message').focus();
      }
    );
});