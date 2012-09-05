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

        activeActions   = [],
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

    this.addContextMenuAction = function(label, action, delimited) {
      $templates.contextMenu
        .tmpl({
          'label':      label,
          'delimited':  delimited
        })
        .on('click', function(e) {
          e.preventDefault();

          var pos = $elements.contextMenu.position();

          $elements.contextMenu.fadeOut('fast', function() {
            self.initAction(action, pos.left, pos.top);
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
                  self.initAction(actionType.action, x, y, evt.target.result);
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
    
    /* Colorpicker – Maybe make it an action? */
    this.componentToHex = function (c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    };
    
    this.rgbToHex = function (r, g, b) {
      return "#" + self.componentToHex(r) + self.componentToHex(g) + self.componentToHex(b);
    };
    
    this.colorpicker = function ($button, callback) {
      var colorpicker = $('#colorpicker').get(0),
          context     = colorpicker.getContext('2d'),
          image       = new Image(),
          imageData,
          color,
          colorTimeout,
          mousePressed = false;
          
      colorpicker.style.cursor = 'crosshair';
          
      image.onload = function() {
        context.drawImage(image, 0, 0);
      };
      
      image.src = '/actions/sketchboard/css/gfx/colorpicker.png';
      
      $(colorpicker).on('mousedown', function (e) {
        clearTimeout(colorTimeout);
        
        var x = e.pageX - $(this).offset().left,
            y = e.pageY - $(this).offset().top;
            
        imageData = context.getImageData(x, y, 1, 1).data;
        color = self.rgbToHex(imageData[0], imageData[1], imageData[2]);
        
        $button.children('span').css('background-color', color);
        
        mousePressed = true;
      });
      
      $(colorpicker).on('mousemove', function (e) {
        if (!mousePressed) return;
        
        clearTimeout(colorTimeout);
        
        var x = e.pageX - $(this).offset().left,
            y = e.pageY - $(this).offset().top;
            
        imageData = context.getImageData(x, y, 1, 1).data;
        color = self.rgbToHex(imageData[0], imageData[1], imageData[2]);
        
        $button.children('span').css('background-color', color);
      });
      
      $(colorpicker).on('mouseup', function (e) {
        colorTimeout = setTimeout(function () {
          if (typeof(callback) === 'function') callback(color);
        }, 300);
        
        mousePressed = false;
      });
    };
    
    this.showColorpicker = function ($button, callback) {
      var $colorpicker = $('body').find('.toolbar.colorpicker'),
          posLeft = $button.offset().left,
          posTop  = $button.offset().top;
      
      if ($colorpicker.length < 1) {
        //$sketchboard.find('.popover:visible').hide();
        $colorpicker = $('#tpl-action-colorpicker').tmpl().hide().appendTo($('body'));
        $colorpicker.css({top: posTop - ($colorpicker.height() / 2), left: posLeft + 48}).show();
        
        self.colorpicker($button, callback);
      } else {
        //$sketchboard.find('.popover:visible').hide();
        $colorpicker.css({top: posTop - ($colorpicker.height() / 2), left: posLeft + 48}).show();
        $colorpicker.show();
      }
      
      $colorpicker.on('click', '.close', function (e) {
        e.preventDefault();
        $colorpicker.remove();
      });
    };

    this.initAction = function(action, x, y, source) {
      action = new action;
      action.init(
        x,
        y,
        $('body', editContext),
        self.publish,
        source
      );

      activeActions.push(action);
    };

    this.publish = function() {
      for (var i in activeActions) {
        if (activeActions.hasOwnProperty(i) && typeof activeActions[i].beforePublish === 'function') {
          activeActions[i].beforePublish();
          delete activeActions[i];
        }
      }
      activeActions = [];

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

    this.loadSource = function(index) {
      $.get('/source?id=' + index, self.viewSource);
    };

    this.viewSource = function(html) {
      self.initAction(codeAction, 0, 0,html);
    };
  };
})(jQuery, window);
