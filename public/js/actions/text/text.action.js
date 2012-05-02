(function($, global) {
  global.textAction = function() {
    var self = this,

        callback,

        $context;

    this.init = function(x, y, $editContext, publishCallback) {

      $context  = $editContext;
      callback  = publishCallback;

      var $message = $('#tpl-action-text-message').tmpl()
                        .addClass('focus')
                        .css({
                          position: 'absolute',
                          left: x,
                          top: y
                        })
                        .appendTo($context)
                        .focus();

      $message.draggable();

    };
  }
})(jQuery, this);