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
          'publishAll':   $('#publish-all'),

          'messageCount': $('#text-messageCount'),
          'clientCount':  $('#text-clientCount'),

          'editIframe':   $('#edit'),

          'messages':     $('#messages')
        },

        editIframe      = $elements.editIframe.get(0),
        editContext     = editIframe.contentDocument || editIframe.contentWindow.document,

        fileDropActions = [];

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
          clientId: data.clientId,
          name:     data.name,
          email:    data.email
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

    this.addContextMenuAction = function(label, callback, delimited) {
      $templates.contextMenu
        .tmpl({
          'label':      label,
          'delimited':  delimited
        })
        .on('click', function(e) {
          e.preventDefault();

          var action  = new callback,
              pos     = $elements.contextMenu.position();

          $elements.contextMenu.fadeOut('fast', function() {
            action.init(
              pos.left,
              pos.top,
              $('body', editContext),
              self.publish
            );
          });
        })
        .appendTo($elements.contextMenu);
    };

    this.fileDrop = function(e) {
      e.preventDefault();
      e.stopPropagation();

      var evt   = e.originalEvent,
          x     = evt.clientX,
          y     = evt.clientY,
          files = evt.dataTransfer.files;

      if (files.length > 0) {
        var file = files[0];

        if (typeof FileReader !== 'undefined' && fileDropActions.length) {
          var reader = new FileReader();

          reader.onload = function (evt) {
            for (var i in fileDropActions) {
              if (fileDropActions.hasOwnProperty(i)) {
                var actionType = fileDropActions[i];

                if (file.type.indexOf(actionType.mime) != -1) {
                  var action = new actionType.action;
                  action.init(
                    x,
                    y,
                    $('body', editContext),
                    app.theWall.publish,
                    evt.target.result
                  );
                }
              }
            }
          };
          reader.readAsDataURL(file);
        }
      }
    };

    this.addFileDropAction = function(mime, action) {
      fileDropActions.push({
        mime:   mime,
        action: action
      });
    };

    this.publish = function() {
      var $editContext  = $('body', editContext),
          html          = $editContext.html();

      app.socket.emit('message', html);

      $editContext.empty();

      self.hidePublishAll();
    };

    this.showPublishAll = function() {
      $elements.publishAll.show();
    };

    this.hidePublishAll = function() {
      $elements.publishAll.hide();
    };

    this.focusLayer = function(index) {
      var $iframes = $elements.messages.find('iframe');
      $iframes.hide();
      $iframes.eq(index).show();
    };

    this.unfocusLayers = function() {
      $elements.messages.find('iframe').show();
    };
  };
})(jQuery, window);
