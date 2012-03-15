jQuery(document).ready(function ($) {
  var editIframe    = $('#edit').get(0),
      $editCanvas   = $('body', editIframe.contentDocument),
      $contextMenu  = $('#contextMenu'),
      $textEditor   = $('#tpl-text'),
      $imageControl = $('#tpl-image'),
      $sketchboard  = $('#tpl-sketchboard'),
      $publishAll   = $('.publish-all');
  
  // Faye
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
  
  // Sign in
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
      
      $('#splash').fadeOut();
    });
	
	// Custom dropdowns
	$('body').on('change', '.dropdown > select', function () {
    $(this).parent().children('span').html($(this).children('option:selected').text());
	});
	
	// Cancel buttons
	$('body').on('click', '.message button.action.cancel', function (e) {
	  e.preventDefault();
	  
	  if ($('body').find('.message').length < 2) {
	    $publishAll.css('opacity', 0);
	  }
	  
	  $(this).closest('.message').remove();
	});
	
	// Publish buttons
	$('body').on('click', '.message button.action.publish', function (e) {
	  e.preventDefault();
	  
	  $(this).closest('.message').each(function () {
	    if ($(this).hasClass('sketchboard')) {
	      var canvas = $(this).find('canvas').get(0),
	          imgSrc = canvas.toDataURL("image/png"),
	          $image = $(document.createElement('img')).attr('src', imgSrc);
	          
	      $(this).html($image).appendTo($editCanvas);
	    } else {
	      $(this).find('.toolbox').remove();
	      $(this).appendTo($editCanvas);
	      $editCanvas.find('*').removeAttr('contenteditable');
	    }
	    
	    app.faye.client.publish('/message', $editCanvas.html());
      $editCanvas.empty();
	  });
	});
	
	$('body').on('click', '.publish-all > a', function (e) {
	  e.preventDefault();
	  
	  $('body').find('.message').each(function () {
	    if ($(this).hasClass('sketchboard')) {
	      var canvas = $(this).find('canvas').get(0),
	          imgSrc = canvas.toDataURL("image/png"),
	          $image = $(document.createElement('img')).attr('src', imgSrc);
	          
	      $(this).html($image).appendTo($editCanvas);
	    } else {
	      $(this).find('.toolbox').remove();
	      $(this).appendTo($editCanvas);
	      $editCanvas.find('*').removeAttr('contenteditable');
	    }
	  });
	  
	  app.faye.client.publish('/message', $editCanvas.html());
	  $editCanvas.empty();
	});
	
	// Font-face
	$('body').on('change', '.message .action.dropdown > .font-face', function () {
	  var $input = $(this).closest('.message').children('input');
	  $(document).get(0).execCommand('fontname', false, $(this).val());
	});
	
	// Font-size
	$('body').on('change', '.message .action.dropdown > .font-size', function () {
	  var $input = $(this).closest('.message').children('input');
	  $(document).get(0).execCommand('fontsize', false, $(this).val());
	});
	
	// Font-style
	$('body').on('click', '.message .action.font-style', function (e) {
	  e.preventDefault();
	  var style  = $(this).attr('rel'),
	      $input = $(this).closest('.message').children('input');
	      
	  $(document).get(0).execCommand(style, false);
	});
	
	// Image control
	$('body').on('keydown', '.message.image input.url', throttle(function (event) {
	  var $image = $(document.createElement('img')),
	      url    = $(this).val();
	      
	  $(this).closest('.message').children('.input').html($image.load().attr('src', url));
	}, 250));
	
	// Context menu
	$editCanvas.contextMenu({menu: 'contextMenu'}, function (action, el, pos) {
	  $publishAll.css('opacity', 1);
	  
	  switch (action) {
	    case 'draw':
	      $sketchboard.tmpl().appendTo($('body')).css({left: pos.docX - 340, top: pos.docY}).sketchboard({style: 'ribbon'}).draggable({handle: '.toolbox'});
	    break;
	    case 'text':
	      $textEditor.tmpl().appendTo($('body')).css({left: pos.docX, top: pos.docY}).draggable({handle: '.toolbox'}).find('p').on('focus', function () {
	        $(this).parent().parent().addClass('focus');
	      }).on('blur', function () {
	        $(this).parent().parent().removeClass('focus');
	      }).focus();
	    break;
	    case 'image':
	      $imageControl.tmpl().appendTo($('body')).css({left: pos.docX, top: pos.docY}).draggable({handle: '.toolbox'});
	    break;
	  }
	});
});

function throttle(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}