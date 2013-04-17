(function($, global) {
  global.textAction = function() {
    var self = this,

        callback,

        $context,
        document,

        $message,
        $toolbar;

    this.init = function(x, y, $editContext, publishCallback, source) {

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
        .on('click',  '.action.font-settings', self.showFontSettings)
        .on('click',  '.action.colorpicker', self.showColorpicker)
        .appendTo('body');
        
      $('body').on('click',  '.popover > .close', self.hidePopover);

      self.showToolbar();
      
      document.execCommand('fontname', false, 'Helvetica');
      document.execCommand('fontsize', false, 5);
    };

    this.showToolbar = function() {
      var pos     = $message.position(),
          width   = ($message.outerWidth() / 2) - ($toolbar.outerWidth() / 2),
          height  = $message.outerHeight();

      $toolbar
        .show();
    };

    this.hideToolbar = function() {
      var selection = document.defaultView.getSelection();
      if (selection.focusNode === null) {
        $toolbar.hide();
      }
    };
    
    this.showColorpicker = function () {
      app.theWall.showColorpicker($(this), function (color) {
        document.execCommand('foreColor', false, color);
      });
    };
    
    this.showFontSettings = function () {
      var $popover = $toolbar.find('.toolbar.fontSettings'),
          $button = $(this),
          posLeft = $button.offset().left,
          posTop  = $button.offset().top;
      
      if ($popover.length < 1) {
        $('body').find('.popover:visible').hide();
        $popover = $('#tpl-action-text-popover').tmpl().hide().appendTo($('body'));
        $popover.css({top: posTop - ($popover.height() / 2), left: posLeft + 48}).show();
        
      } else {
        $('body').find('.popover:visible').hide();
        $popover.show();
      }
    };
    
    this.hidePopover = function () {
      $(this).closest('.popover').hide();
    };

    this.moveMessage = function(e, ui) {
      var pos     = ui.offset,
          width   = ($message.outerWidth() / 2) - ($toolbar.outerWidth() / 2),
          height  = $message.outerHeight();

      $message.css({
          left: pos.left - width,
          top:  pos.top - height
        })
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

    this.beforePublish = function() {
      $toolbar.remove();
      $message.removeAttr('contenteditable');
    }
  }
})(jQuery, this);