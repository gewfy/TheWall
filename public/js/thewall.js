!function ($) {
  "use strict";
  
  var Thewall = function (element, options) {
    this.init(element, options);
  };
  
  Thewall.prototype = {
    constructor: Thewall,
    
    init: function (element, options) {
      this.$element = $(element);
      this.editIframe = $('#edit').get(0);
      this.$editCanvas = $('body', this.editIframe.contentDocument);
      
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
        $('#tpl-layer').tmpl(messages).appendTo('#layers');
      
        $('#text-messageCount').text(messages.count);
      });
      
      app.faye.client.subscribe('/clients', function(clients) {
        var $clients = $('#clients');
      
        $clients.empty();
      
        for (var i in clients) {
          $('#tpl-client').tmpl(clients[i]).appendTo($clients);
        }
      
        $('#text-clientCount').text(clients.length);
      });
    },
    
    openMessageBox: function (options) {
      var $tmpl       = $(options.tmpl),
          animation   = options.animation || 'slideUp',
          left        = (options.pos) ? options.pos.docX : 0,
          top         = (options.pos) ? options.pos.docY : 0,
          $message    = $tmpl.tmpl(),
          $editFrame  = $('#edit').show(),
          $editCanvas = this.$editCanvas,
          delay;
          
      if ($message.hasClass('code-editor')) {
        $message.appendTo(this.$element).animate({
          height: '343px'
        }, function () {
          $(this).on('click', '.btn.hide', function (e) {
            e.preventDefault();
            $(this).removeClass('hide').addClass('show').html('Show').closest('.message').animate({height: '43px'});
          });
          
          $(this).on('click', '.btn.show', function (e) {
            e.preventDefault();
            $(this).removeClass('show').addClass('hide').html('Hide').closest('.message').animate({height: '343px'});
          });
        });
        
        var editor = CodeMirror.fromTextArea($('.message.code-editor > .input > textarea').get(0), {
          mode: "application/xml",
          lineNumbers: true,
          lineWrapping: true,
          onCursorActivity: function() {
            editor.setLineClass(hlLine, null);
            hlLine = editor.setLineClass(editor.getCursor().line, "activeline");
          },
          onChange: function() {
            clearTimeout(delay);
            delay = setTimeout(function () {
              var $codeHolder = $(document.createElement('div')).addClass('custom-code'),
                  code        = editor.getValue();
                  
              $(this).removeClass('preview').addClass('edit').html('Edit');
                  
              if ($editCanvas.find('.custom-code').length > 0) {
                $editCanvas.find('.custom-code').html(code);
              } else {    
                $codeHolder.html(code);
                $editCanvas.append($codeHolder);
              }
            }, 300);
          }
        });
        
        var hlLine = editor.setLineClass(0, "activeline");
      } else {
        $message.addClass('focus').css({opacity: 0, position: 'absolute', top: top + 50, left: left}).appendTo(this.$element).animate({
          top: top,
          opacity: 1
        }, 200).find('.input > p').on('focus', function () {
          $(this).closest('.message').addClass('focus');
        }).on('blur', function () {
          $(this).closest('.message').removeClass('focus');
        }).focus();
        
        if ($message.hasClass('sketchboard')) {
          $('#thewall > .sketchboard').sketchboard({style: 'ribbon'});
          $message.children('.toolbox').draggable();
        } else {
          $message.draggable({
            handle: '.toolbox'
          });
        }
      }
    },
    
    closeMessageBox: function (element, options) {
      var $thewall = this.$element,
          $editCanvas = this.$editCanvas,
          $editFrame  = $('#edit').show();
      
      if ($(element).hasClass('code-editor')) {
        $(element).animate({height: '0'}, 300, function () {
          $(this).remove();
          $editCanvas.empty();
          $editFrame.hide();
          
          if ($thewall.find('.message').length < 1) {
            $('.publish-all').css('opacity', 0);
          }
        });
      } else {
        $(element).animate({top: '+=50px', opacity: 0}, 200, function () {
          $(this).remove();
          
          if ($thewall.find('.message').length < 1) {
            $('.publish-all').css('opacity', 0);
          }
        });
      }
    },
    
    sendMessage: function (element) {
      var $message    = $(element),
          $thewall    = this.$element,
          $editCanvas = this.$editCanvas,
          $dummy      = $(document.createElement('div'));
      
      if ($message.hasClass('sketchboard')) {
	      var canvas   = $message.find('canvas').get(0),
	          imgSrc   = canvas.toDataURL("image/png"),
	          $image   = $(document.createElement('img')).attr('src', imgSrc);
        
        $message.find('.toolbox').animate({top: '+=50px', opacity: 0}, 200);
        
        $message.fadeOut(200, function () {
          $message.html($image).find('.toolbox').remove();
          app.faye.client.publish('/message', $message.html());
          
          $message.remove();
          
          if ($thewall.find('.message').length < 1) {
            $('.publish-all').css('opacity', 0);
          }
        });
	    } else if ($message.hasClass('code-editor')) {
        $message.animate({height: 0}, 300, function () {
          $(this).remove();
          
          if ($thewall.find('.message').length < 1) {
            $('.publish-all').css('opacity', 0);
          }
        });
        
        app.faye.client.publish('/message', $editCanvas.html()); 
        $editCanvas.empty();    
	    } else {
        $message.clone().appendTo($dummy).find('*').removeAttr('contenteditable');
        $dummy.find('.toolbox').remove();
        $dummy.find('.slider').remove();
	    
	      $message.find('.toolbox').animate({bottom: '-=50px', opacity: 0}, 200, function () {
          $message.remove();
          app.faye.client.publish('/message', $dummy.html());
          
          if ($thewall.find('.message').length < 1) {
            $('.publish-all').css('opacity', 0);
          }
        });
	    }
    },
    
    sendMessages: function () {
      this.$element.find('.message').each(function () {
        var $message    = $(this),
            $editCanvas = this.$editCanvas,
            $dummy      = $(document.createElement('div'));
        
        if ($message.hasClass('sketchboard')) {
          var canvas   = $message.find('canvas').get(0),
              imgSrc   = canvas.toDataURL("image/png"),
              $image   = $(document.createElement('img')).attr('src', imgSrc);
          
          $message.find('.toolbox').animate({top: '+=50px', opacity: 0}, 200);
          
          $message.fadeOut(200, function () {
            $message.html($image).find('.toolbox').remove();
            app.faye.client.publish('/message', $message.html());
            
            $message.remove();
          });
        } else if ($message.hasClass('code-editor')) {
          $message.animate({height: 0}, 200, function () {
            $(this).remove();
          });
          
          app.faye.client.publish('/message', $editCanvas.html());     
        } else {
          $message.clone().appendTo($dummy).find('*').removeAttr('contenteditable');
          $dummy.find('.toolbox').remove();
          $dummy.find('.slider').remove();
        
          $message.find('.toolbox').animate({bottom: '-=50px', opacity: 0}, 200, function () {
            $message.remove();
            app.faye.client.publish('/message', $dummy.html());
          });
        }
      });
    },
    
    createButtonFlyout: function (options) {
    }
  };
  
  $.fn.thewall = function (options) {
    return this.each(function () {
      var $this = $(this),
          data  = $this.data('thewall');
          
      if (!data) $this.data('thewall', (data = new Thewall(this, options)));
    });
  }; 
}(window.jQuery);