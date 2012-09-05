(function($, global) {
  global.sketchboardAction = function() {
    var self = this,

        callback,

        $sketchboard,

        $context;

    this.init = function(x, y, $editContext, publishCallback, source) {

      $context  = $editContext;
      callback  = publishCallback;
      app.theWall = new theWall;

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
      $sketchboard.sketchboard({style: 'simple'})
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
      app.theWall.showColorpicker($(this), function (color) {
        $sketchboard.attr('data-color', color).trigger('colorchanged');
      });
    };
    
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