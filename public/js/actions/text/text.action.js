(function($, global) {
  global.textAction = function() {
    var self = this,

        callback,

        $context,
        document,

        $message,
        $toolbar;

    this.init = function(x, y, $editContext, publishCallback) {

      $context  = $editContext;
      callback  = publishCallback;

      document  = $context.get(0).ownerDocument;

      $message = $('#tpl-action-text-message').tmpl();
      $toolbar = $('#tpl-action-text-toolbar').tmpl();

      $message
        .css({
          position: 'absolute',
          left: x,
          top: y
        })
        .on('blur',         self.hideToolbar)
        .on('focus keyup',  self.showToolbar)
        .appendTo($context)
        .focus();

      $toolbar
        .on('change', '.font-face',   self.changeFontFace)
        .on('change', '.font-size',   self.changeFontSize)
        .on('click',  '.font-style',  self.changeFontStyle)
        .on('click',  '.publish',     self.publish)
        .on('click',  '.cancel',      self.cancel)
        .appendTo('body');

      self.showToolbar();
    };

    this.showToolbar = function() {
      var pos     = $message.position(),
          width   = ($message.outerWidth() / 2) - ($toolbar.outerWidth() / 2),
          height  = $message.outerHeight();

      $toolbar
        .css({
          left: pos.left + width,
          top:  pos.top + height
        })
        .show();
    };

    this.hideToolbar = function() {
      var selection = document.defaultView.getSelection();
      if (selection.focusNode === null) {
        $toolbar.hide();
      }
    };

    this.changeFontFace = function() {
      document.execCommand('fontname', false, $(this).val());
      self.showToolbar();
      $message.focus();
    };

    this.changeFontSize = function() {
      document.execCommand('fontsize', false, $(this).val());
      self.showToolbar();
      $message.focus();
    };

    this.changeFontStyle = function() {
      document.execCommand($(this).attr('rel'), false);
      self.showToolbar();
      $message.focus();
    };

    this.publish = function() {
      callback();
      self.cancel();
    };

    this.cancel = function() {
      $message.remove();
      $toolbar.remove();
    };
  }
})(jQuery, this);