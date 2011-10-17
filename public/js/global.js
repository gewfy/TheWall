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

  var editIframe    = $('#edit').get(0),
      $editCanvas   = $('body', editIframe.contentDocument),
      $contextMenu  = $('#contextMenu'),
      $fontControl  = $('#fontControl'),
      $imageControl = $('#imageControl');

  $('#button-send').bind('click', function(e) {
    e.preventDefault();

    $editCanvas.find('*').removeAttr('contenteditable');

    app.faye.client.publish('/message', $editCanvas.html());

    $editCanvas.empty();
    $('#fontControl').hide();
  });

  var $mouseFollower  = $('#mouseFollower');

  $mouseFollower.show();

  $editCanvas
    .bind('mousemove', function(e) {
      $mouseFollower.css({
        left: e.clientX,
        top:  e.clientY
      });
    })
    .bind('click', function() {
      $contextMenu.hide();
      $fontControl.hide();
      $imageControl.hide();
    })
    .contextMenu(
      { menu: 'contextMenu' },
      function(action, el, pos) {
        $mouseFollower.addClass('disable');
        $fontControl.hide();
        $imageControl.hide();
        
        switch (action) {
          case 'text':

            var $div = $('<div class="text"><div><p></p></div></div>')
              .css({
                left: pos.docX,
                top:  pos.docY
              })
              .appendTo($editCanvas);

            $div.find('div')
              .attr('contenteditable', 'true')
              .bind('click', function(e) {
                e.stopPropagation();
              })
              .bind('focus keydown keyup', function() {
                var $this         = $(this).parent(),
                    position      = $this.position();

                $imageControl.hide();

                $fontControl.css({
                  left: (position.left + (($this.width() / 2) - ($fontControl.width() / 2))),
                  top:  position.top + $this.height()
                }).show();
              })
              .bind('blur', function(e) {
                if (!$(this).text()) {
                  $(this).parent().remove();
                }
              })
              .focus();

          break;
          case 'image':

            $imageControl
              .css({
                left: pos.docX,
                top:  pos.docY - ($imageControl.height() / 2)
              })
              .show()
              .find('input').focus();

          break;
        }
      }
    );

  $contextMenu
    .bind('mouseenter', function() {
      $mouseFollower.hide();
    })
    .bind('mouseleave', function() {
      $mouseFollower.show();
    });

  $('#font-bold').bind('click', function(e) {
    editIframe.contentDocument.execCommand('bold', null, false);
  });

  $('#font-italic').bind('click', function() {
    editIframe.contentDocument.execCommand('italic', null, false);
  });

  $imageControl.find('input').bind('keypress', function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);

    if(code == 13) {
      var url       = $('#input-image').val(),
          position  = $imageControl.position();

      $('<div class="image"><img src="' + url + '"/></div>')
        .css({
          left: position.left,
          top:  position.top + ($imageControl.height() / 2)
        })
        .appendTo($editCanvas);

      $imageControl.hide();
    }
  });
});