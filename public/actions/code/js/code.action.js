(function($, global) {
  global.codeAction = function() {
    var self = this,

        callback,

        $editor,
        editor,

        $context;

    this.init = function(x, y, $editContext, publishCallback) {

      $context  = $editContext;
      callback  = publishCallback;

      if (!$editor) {
        $editor = $('#tpl-action-code').tmpl().appendTo('body');

        $editor
          .on('click', '.action.publish',  self.publish)
          .on('click', '.action.show',     self.showEditor)
          .on('click', '.action.hide',     self.hideEditor)
          .on('click', '.action.cancel',   self.closeEditor);

        self.initEditor();
        $editor.animate({ height: '338px' });
      }
    };

    this.initEditor = function() {
      var updateDelay;

      editor = CodeMirror.fromTextArea(
        $editor.find('.input > textarea').get(0),
        {
          mode:         'text/html',
          lineNumbers:  true,
          lineWrapping: true,
          onChange:     function() {
            clearTimeout(updateDelay);
            updateDelay = setTimeout(function () {
              self.updateContext(editor.getValue());
            }, 300);
          }
        }
      );
    };

    this.updateContext = function(html) {
      var canvas    = $context.get(0),
          document  = canvas.ownerDocument;

      canvas.innerHTML = html;

      var scripts = canvas.getElementsByTagName('script');
      for ( var i = 0; scripts[i]; i++ ) {
        var script = scripts[i];
        if (!script.type || script.type.toLowerCase() === 'text/javascript') {
          var data    = (script.text || script.textContent || script.innerHTML || ""),

              head    = document.getElementsByTagName('head')[0] || document.documentElement,
              element = document.createElement('script');

          element.type = 'text/javascript';
          element.appendChild(document.createTextNode(data));
          head.insertBefore(element, head.firstChild);
          head.removeChild(element);
        }
      }
    };

    this.publish = function() {
      self.closeEditor();
      callback();
    };

    this.showEditor = function() {
      $(this)
        .removeClass('show')
        .addClass('hide')
        .html('Hide');

      $editor.animate({height: '343px'});
    };

    this.hideEditor = function() {
      $(this)
        .removeClass('hide')
        .addClass('show')
        .html('Show');

      $editor.animate({height: '38px'});
    };

    this.closeEditor = function() {
      $editor.remove();
      $editor = null;
    };
  }
})(jQuery, this);