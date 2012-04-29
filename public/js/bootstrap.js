jQuery(function($) {

  app.theWall = new theWall;

  app.socket  = io.connect('/');

  app.socket.on('ready',    app.theWall.receiveReady);
  app.socket.on('messages', app.theWall.receiveMessages);
  app.socket.on('clients',  app.theWall.receiveClients);

  $('body')
    .on('submit', '#form-setName', function(e) {
      e.preventDefault();

      app.theWall.publishClient({
        clientId: app.clientId,
        name:     $('#input-name').val(),
        email:    $('#input-email').val()
      });
    })

    .on('contextmenu',  '#thewall', function(){ return false; })
    .on('mousedown',    '#thewall', app.theWall.contextMenu);
  
  app.theWall.addAction('Add text');
  app.theWall.addAction('Add image');
  app.theWall.addAction('Add video');
  app.theWall.addAction('Add drawing');
  app.theWall.addAction('Add custom code', null, true);
});