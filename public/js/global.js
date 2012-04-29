jQuery(document).ready(function ($) { 
  var thewall, 
      sliderTimeout, 
      $thewall = $('#thewall'), 
      $contextMenu = $('#contextMenu'),
      $publishAll    = $('.publish-all');
  
  $thewall.thewall();
  thewall = $thewall.data('thewall');
  
  // Signin
  $('#form-setName').submit(function(e) {
    e.preventDefault();

    app.socket.emit(
      $(this).attr('action'),
      {
        clientId: app.clientId,
        name:     $('#input-name').val(),
        email:    $('#input-email').val()
      }
    );
    
    $('#splash').fadeOut();
  });
  
  // Dropdowns
  $('body').on('change', '.select > select', function () {
    $(this).parent().children('span').html($(this).children('option:selected').text());
  });
  
  // Layers
  $('body').on('mouseenter', '#layers li', function () {
    $('#messages > iframe').not($('#messages > iframe').eq($(this).index())).fadeOut('fast');
  });
  
  $('body').on('mouseleave', '#layers li', function () {
    $('#messages > iframe').fadeIn('fast');
  });
  
  // Slider
  $('body').on('change', '.message input[type="range"]', function () {
    var $this = $(this);
    clearTimeout(sliderTimeout);
    
    sliderTimeout = setTimeout(function () {
      $this.closest('.message').children('.input').children('img').width($this.val());
    }, 300);
  });
  
  // Destroy
  $('body').on('click', '.message > .toolbox .cancel', function (e) {
    e.preventDefault();
    thewall.closeMessageBox($(this).closest('.message').get(0), '');
  });
  
  // Publish single
	$('body').on('click', '.message > .toolbox .publish', function (e) {
    thewall.sendMessage($(this).closest('.message').get(0));
	});
	
	// Publish all
	$('body').on('click', '.publish-all > a', function (e) {
	  thewall.sendMessages();
	  $publishAll.css('opacity', 0);
	});
	
	// Font-face
	$('body').on('change', '.message .select > .font-face', function () {
	  var $input = $(this).closest('.message').children('input');
	  $(document).get(0).execCommand('fontname', false, $(this).val());
	});
	
	// Font-size
	$('body').on('change', '.message .select > .font-size', function () {
	  var $input = $(this).closest('.message').children('input');
	  $(document).get(0).execCommand('fontsize', false, $(this).val());
	});
	
	// Font-style
	$('body').on('click', '.message .btn.font-style', function (e) {
	  e.preventDefault();
	  var style  = $(this).attr('rel'),
	      $input = $(this).closest('.message').children('input');
	      
	  $(document).get(0).execCommand(style, false);
	});
	
	// Image control
	$('body').on('keydown', '.message.image input.url', throttle(function (event) {
	  var $image = $(document.createElement('img')),
	      url    = $(this).val();
	      
	  $(this).closest('.message').children('.input').html($image.load(function () {
	    $(this).closest('.message').find('.slider > input').attr({max: $(this).width() * 2, value: $(this).width()});
	    $(this).closest('.message').addClass('has');
	  }).attr('src', url));
	}, 250));

  // Context menu 
  $thewall.bind("contextmenu",function(e){
    return false;
  });
 
  $thewall.on('mousedown', function (e) {
    var left = e.clientX,
        top  = e.clientY;
    
    if (e.which == 3) {
      e.preventDefault();
      
      $contextMenu.css({left: e.clientX, top: e.clientY}).fadeIn('fast').on('click', 'li > a', function (e) {
        e.preventDefault();
        var action = $(this).attr('href').replace('#', '');
        $contextMenu.fadeOut('fast').off('click', 'li > a', false);
        
        $publishAll.css('opacity', 1);
        
        switch (action) {
          case 'draw':
            thewall.openMessageBox({animation: 'slideUp', tmpl: '#tpl-sketchboard'});
          break;
          case 'text':
            thewall.openMessageBox({animation: 'slideUp', tmpl: '#text-message', pos: {docX: left, docY: top}});
          break;
          case 'image':
            thewall.openMessageBox({animation: 'slideUp', tmpl: '#img-message', pos: {docX: left, docY: top}});
          break;
          case 'code':
            thewall.openMessageBox({animation: 'slideUp', tmpl: '#code-message'});
          break;
        }
      });
    } else if (e.which == 1) {
      $contextMenu.fadeOut('fast').off('click', 'li > a');
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