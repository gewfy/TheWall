(function($, global) {
  global.theWall = function() {
    var self = this,

        $templates = {
          'iframe':       $('#tpl-iframe'),
          'layer':        $('#tpl-layer'),
          'client':       $('#tpl-client'),
          'contextMenu':  $('#tpl-contextMenu')
        },

        $elements = {
          'splash':       $('#splash'),
          'contextMenu':  $('#contextMenu'),

          'messageCount': $('#text-messageCount'),
          'clientCount':  $('#text-clientCount'),

          editIframe:     $('#edit')
        };

    this.receiveReady = function() {
      $elements.splash.fadeOut();
    };

    this.receiveMessages = function(messages) {
      $templates.iframe.tmpl(messages).appendTo('#messages');
      $templates.layer.tmpl(messages).appendTo('#layers');

      $elements.messageCount.text(messages.count);
    };

    this.receiveClients = function(clients) {
      var $clients = $('#clients');

      $clients.empty();

      for (var i in clients) {
        if (clients.hasOwnProperty(i)) {
          $templates.client.tmpl(clients[i]).appendTo($clients);
        }
      }

      $elements.clientCount.text(clients.length);
    };

    this.publishClient = function(data) {
      app.socket.emit(
        'client',
        {
          clientId: app.clientId,
          name:     $('#input-name').val(),
          email:    $('#input-email').val()
        }
      );
    };

    this.contextMenu = function(e) {
      if (e.button == 2) {
        $elements.contextMenu
          .css({
            left: e.clientX,
            top:  e.clientY
          })
          .show();

      } else if (e.button == 0) {
        $elements.contextMenu.fadeOut('fast');
      }
    };

    this.addAction = function(action, callback, delimited) {
      $templates.contextMenu
        .tmpl({
          'action':     action,
          'delimited':  delimited
        })
        .on('click', function(e) {
          e.preventDefault();

          var pos = $elements.contextMenu.position();

          $elements.contextMenu.fadeOut('fast', function() {
            var editIframe  = $elements.editIframe.get(0),
                editContext = editIframe.contentDocument ||editIframe.contentWindow.document;

            callback(
              pos.left,
              pos.top,
              $('body', editContext)
            );
          });
        })
        .appendTo($elements.contextMenu);
    };
  };
})(jQuery, this);
