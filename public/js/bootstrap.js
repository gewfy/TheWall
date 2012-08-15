jQuery(function($) {

  app.theWall = new theWall;

  app.socket  = io.connect('/');

  app.socket.on('ready',    app.theWall.receiveReady);
  app.socket.on('messages', app.theWall.receiveMessages);
  app.socket.on('clients',  app.theWall.receiveClients);

  /* Client already registered - publish client */
  if (app.client.name) {
    app.theWall.publishClient({
      clientId: app.clientId,
      name:     app.client.name,
      email:    app.client.email
    });
  }

  $('body')
    .on('submit', '#form-setName', function(e) {
      e.preventDefault();

      app.theWall.publishClient({
        clientId: app.clientId,
        name:     $('#input-name').val(),
        email:    $('#input-email').val()
      });
    })

    .on('click',        '#publish-all > a', app.theWall.publish)

    .on('mouseenter',   '#layers li',       function () {
      app.theWall.focusLayer($(this).index());
    })

    .on('mouseleave',   '#layers',       app.theWall.unfocusLayers)
    .on('dragstart resizestart', function() { $(this).addClass('dragging'); })
    .on('dragstop resizestop', function() { $(this).removeClass('dragging'); });

  $($('#edit').get(0).contentDocument)
    .on('DOMSubtreeModified', app.theWall.showPublishAll)

    .on('contextmenu',        function(){ return false; })
    .on('mousedown',          app.theWall.contextMenu)

    .on('dragover',           function(e) { e.preventDefault();  e.stopPropagation(); return false; })
    .on('dragenter',          function(e) { e.preventDefault();  e.stopPropagation(); return false; })
    .on('drop',               app.theWall.fileDrop);

  /* Context menu actions */
  app.theWall.addContextMenuAction('Add text',         textAction);
  app.theWall.addContextMenuAction('Add image');
  app.theWall.addContextMenuAction('Add video');
  app.theWall.addContextMenuAction('Add drawing',      sketchboardAction);
  app.theWall.addContextMenuAction('Add custom code',  codeAction, true);

  /* File drop actions */
  app.theWall.addFileDropAction('image', imageAction);
});