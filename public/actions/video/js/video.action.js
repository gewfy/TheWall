(function($, global) {
  global.videoAction = function() {
    var self = this,

        callback,

        $context,
        document,

        x, y,

        $video,
        $overlay,

        $toolbar,
        $input;


    this.init = function(posX, posY, $editContext, publishCallback, source) {
      $context  = $editContext;
      callback  = publishCallback;

      x = posX;
      y = posY;

      document  = $context.get(0).ownerDocument;

      if (source) {
        self.setSource(source);
      }
      else {
        $toolbar  = $('#tpl-action-video-toolbar').tmpl();
        $input    = $toolbar.find('.source');
        $toolbar
          .on('keypress', '.source', function(e) {
            if (e.keyCode === 13) {
              self.setSourceFromInput();
            }
          })
          .on('click', '.add', self.setSourceFromInput)
          .on('click', '.cancel', self.cancel)

          .appendTo('body')
          .show()
          .css({
            left: x - ($toolbar.outerWidth(true) / 2),
            top:  y
          });

        $input.focus();
      }
    };

    this.setSource = function(source) {
      if (source.indexOf('youtube.com') !== -1 || source.indexOf('youtu.be') !== -1) {
        var matchYoutube = new RegExp('[\=/]([a-zA-Z0-9_-]{11})'),
            id  = source.match(matchYoutube),
            url = 'http://www.youtube.com/embed/' + id[1] + '?autoplay=1&wmode=transparent&autohide=1&egm=0&hd=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0&showsearch=0';
      }
      else if (source.indexOf('vimeo') !== -1) {
        var matchVimeo = new RegExp('[0-9]+'),
            id  = source.match(matchVimeo),
            url = 'http://player.vimeo.com/video/' + id[0] + '?title=0&byline=0&portrait=0&color=ffffff&autoplay=1';
      }
      else {
        return false;
      }

      if (!$video) {
        $video = $('<iframe width="500" height="281" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowfullscreen/>');
        $video
          .on('load', self.initOverlay)
          .attr('src', url)
          .appendTo($context);
      }

      self.setPosition();
    };

    this.setSourceFromInput = function() {
      var source = $input.val();
      if (source) {
        self.setSource($input.val());
        $toolbar.remove();
      }
    };

    this.setPosition = function() {
      if ($video) {
        $video.css({
          'position': 'absolute',
          'left':     x,
          'top':      y
        });
      }
    };

    this.initOverlay = function() {
      $overlay = $('<div/>');
      $overlay
        .css({
          'position': 'absolute',
          'left':     x,
          'top':      y,
          'width':    $video.width(),
          'height':   $video.height(),
          'zIndex':   6
        })
        .on('drag',   self.moveVideo)
        .on('resize', self.resizeVideo)
        .appendTo('body')
        .resizable({
          aspectRatio:  true,
          handles:      'ne, se, sw, nw'
        })
        .draggable();
    };

    this.moveVideo = function(e, ui) {
      x = ui.offset.left;
      y = ui.offset.top;

      self.setPosition();
    };

    this.resizeVideo = function(e, ui) {
      $video.css({
        width:  ui.size.width,
        height: ui.size.height
      });

      x = ui.position.left;
      y = ui.position.top;

      self.setPosition();
    };

    this.removeVideo = function() {
      $video.remove();
    };

    this.cancel = function() {
      $toolbar.remove();
    };

    this.beforePublish = function() {
      if ($toolbar) {
        $toolbar.remove();
      }
      if ($overlay) {
        $overlay.remove();
      }
    }
  }
})(jQuery, this);