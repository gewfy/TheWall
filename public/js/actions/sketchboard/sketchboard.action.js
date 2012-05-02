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
          .on('click', '.action.publish',  self.publish)
          .on('click', '.action.cancel',   self.closeSketchboard);

        self.initSketchboard();
      }
      
    };

    this.initSketchboard = function() {
      $sketchboard.sketchboard({style: 'ribbon'})
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