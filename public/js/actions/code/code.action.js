(function($, global) {
  global.codeAction = function() {
    var self = this;

    this.show = function(x, y, $context) {
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
              $('#edit').get(0).contentDocument.open();
              $('#edit').get(0).contentDocument.write(code);
              $('#edit').get(0).contentDocument.close();
            } else {
              $('#edit').get(0).contentDocument.open();
              $('#edit').get(0).contentDocument.write(code);
              $('#edit').get(0).contentDocument.close();
              $editCanvas.append($codeHolder);
            }
          }, 300);
        }
      });

      var hlLine = editor.setLineClass(0, "activeline");
    }

    this.open
  }
})(jQuery, this);