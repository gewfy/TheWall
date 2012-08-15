(function($, global) {
  global.sketchboardAction = function() {
    var self = this,

        callback,

        $sketchboard,

        $context;

    this.init = function(x, y, $editContext, publishCallback) {

      $context  = $editContext;
      callback  = publishCallback;

      if (!$sketchboard) {
        $sketchboard = $('#tpl-action-sketchboard').tmpl().appendTo('body');
        
        $sketchboard
          .on('click',  '.action.publish',        self.publish)
          .on('click',  '.action.cancel',         self.closeSketchboard)
          .on('click',  '.action.brush-settings', self.showBrushSettings)
          .on('click',  '.popover > .close',      self.hidePopover)
          .on('click',  '.action.colorpicker',    self.showColorpicker);

        self.initSketchboard();
      }
      
    };

    this.initSketchboard = function() {
      $sketchboard.sketchboard({style: 'ribbon'})
    };
    
    this.showBrushSettings = function () {
      var $popover = $sketchboard.find('.toolbar.brushSettings'),
          $button = $(this),
          posLeft = $button.offset().left,
          posTop  = $button.offset().top,
          sliderTimeout;
      
      if ($popover.length < 1) {
        $sketchboard.find('.popover:visible').hide();
        $popover = $('#tpl-action-sketchboard-popover').tmpl().hide().appendTo($sketchboard);
        $popover.css({top: posTop - ($popover.height() / 2), left: posLeft + 48}).show();
        
      } else {
        $sketchboard.find('.popover:visible').hide();
        $popover.show();
      }
      
      $popover.on('change', '.slider > input', function () {
        var val = $(this).val();
        clearTimeout(sliderTimeout);
        
        sliderTimeout = setTimeout(function () {
          $sketchboard.attr('data-size', val).trigger('sizechanged');
        }, 300);
      });
      
      $popover.on('change', '.brush-style', function () {
        $sketchboard.attr('data-brush', $(this).val()).trigger('brushchanged');
      });
    };
    
    this.showColorpicker = function () {
      var $colorpicker = $sketchboard.find('.toolbar.colorpicker'),
          $button = $(this),
          posLeft = $button.offset().left,
          posTop  = $button.offset().top;
      
      if ($colorpicker.length < 1) {
        $sketchboard.find('.popover:visible').hide();
        $colorpicker = $('#tpl-action-sketchboard-colorpicker').tmpl().hide().appendTo($sketchboard);
        $colorpicker.css({top: posTop - ($colorpicker.height() / 2), left: posLeft + 48}).show();
        
        self.colorpicker($button);
      } else {
        $sketchboard.find('.popover:visible').hide();
        $colorpicker.show();
      }
    };
    
    this.componentToHex = function (c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    };
    
    this.rgbToHex = function (r, g, b) {
      return "#" + self.componentToHex(r) + self.componentToHex(g) + self.componentToHex(b);
    };
    
    this.colorpicker = function ($button) {
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
      
      image.src = '/css/actions/sketchboard/colorpicker.png';
      
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
          $sketchboard.attr('data-color', color).trigger('colorchanged');
        }, 300);
        
        mousePressed = false;
      });
    }
    
    this.hidePopover = function () {
      $(this).closest('.popover').hide();
    };
    
    this.publish = function () {
      var canvas   = $sketchboard.find('canvas').get(0),
          imgSrc   = canvas.toDataURL("image/png"),
          $image   = $(document.createElement('img')).attr('src', imgSrc);
          
      $context.append($image);
      self.closeSketchboard();
      callback();
    };

    this.closeSketchboard = function() {
      $sketchboard.remove();
      $sketchboard = null;
    };
  }
})(jQuery, this);