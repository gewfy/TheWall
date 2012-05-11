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
    .on('drop',               function(e) {
      e.preventDefault();
      e.stopPropagation();

      var evt   = e.originalEvent,
          x     = evt.clientX,
          y     = evt.clientY,
          files = evt.dataTransfer.files;

      if (files.length > 0) {
     		var file = files[0];
     		if (typeof FileReader !== "undefined" && file.type.indexOf("image") != -1) {
     			var reader = new FileReader();

     			reader.onload = function (evt) {
             var image = new imageAction;
             image.init(x, y, $('body', $('#edit').get(0).contentDocument), app.theWall.publish);
             image.setSource(evt.target.result);
     			};
          reader.readAsDataURL(file);
     		}
     	}
    });


  app.theWall.addAction('Add text',         textAction);
  app.theWall.addAction('Add image');
  app.theWall.addAction('Add video');
  app.theWall.addAction('Add drawing',      sketchboardAction);
  app.theWall.addAction('Add custom code',  codeAction, true);
});