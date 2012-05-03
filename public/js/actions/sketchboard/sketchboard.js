(function ($) {

	var Sketchboard = function (element, options) {
	
		var $element = $(element),
			object   = this,
			canvas,
			contex,
			flattenCanvas,
			flattenContext,
			defaults,
			settings,
			count    = 0,
			points   = new Array(),
			painters = new Array(),
			draw     = false,
			brushInterval = null,
			lastMove = null,
			resizeTimeout;
			
			defaults = {
				width     : 'fill',
				height    : 'fill',
				color     : '#000000',
				bgcolor   : '#ffffff',
				opacity   : 1,
				lineCap   : 'round',
				lineWidth : 1,
				style     : 'fur',
				id        : 'canvas'
		};
		
		settings = $.extend(defaults, options);
		
		this.init = function () {		
			this.prevX = '';
			this.prevY = '';
			
			this.rgb             = [object.HexToRgb.toR(settings.color), object.HexToRgb.toG(settings.color), object.HexToRgb.toB(settings.color)];
			
			this.canvasWidth     = (settings.width == 'fill') ? $element.outerWidth() : settings.width;
			this.canvasHeight    = (settings.height == 'fill') ? $element.outerHeight() : settings.height;
			
			this.canvas          = $(document.createElement('canvas')).attr('id', settings.id).css({position: 'absolute', top: 0, left: 0, 'z-index': 2}).appendTo($element);
			this.canvas          = this.canvas.get(0);
			this.context         = this.canvas.getContext('2d');
			
			this.canvas.width    = this.canvasWidth;
			this.canvas.height   = this.canvasHeight;
			
			this.context.lineCap = settings.lineCap;
			this.context.globalCompositeOperation = 'source-over';
			this.context.strokeStyle = 'rgba(' + this.rgb[0] + ', ' + this.rgb[1] + ', ' + this.rgb[2] + ', ' + settings.opacity + ')';
			this.context.lineWidth = settings.lineWidth;
			
			styles[settings.style].init();
		};
		
		this.newSetting = function (setting, value) {
			settings[setting] = value;
		
			object.rgb                 = [object.HexToRgb.toR(settings.color), object.HexToRgb.toG(settings.color), object.HexToRgb.toB(settings.color)];
			object.context.strokeStyle = 'rgba(' + this.rgb[0] + ', ' + this.rgb[1] + ', ' + this.rgb[2] + ', ' + settings.opacity + ')';
			object.context.lineWidth   = settings.lineWidth;
			object.context.lineCap     = settings.lineCap;
			
			styles[settings.style].init();
			
			if (setting == 'bgcolor') {
				//object.backContext.fillStyle = value;
				//object.backContext.fillRect(0, 0, object.canvasWidth, object.canvasHeight);
			}
			
			//window.location.href = '/html5';
		};
		
		this.getSetting = function (setting) {
			return settings[setting];
		};
		
		this.save = function (e) {
			e.preventDefault();
			var url = object.canvas.toDataURL("image/png"),
					image = new Image();
					
			image.addEventListener("load", function (event) {
	          image.removeEventListener(event.type, arguments.callee, false);
	          object.backContext.drawImage(image, 0, 0);
						
						url = object.backCanvas.toDataURL("image/png");
						window.location.href = url;
	    }, false);
	    image.src = url;
		}
		
		this.bargs = function (_fn) {
    	var n, args = [];
    	for( n = 1; n < arguments.length; n++ )
    		args.push( arguments[ n ] );
    	return function () { return _fn.apply( this, args ); };
    }
		
		var styles = {
		  ribbon: {
		    init: function() {          
          object.context.strokeStyle = 'rgba(' + object.rgb[0] + ', ' + object.rgb[1] + ', ' + object.rgb[2] + ', 0.05)';
          
          this.mouseX = window.innerWidth / 2;
          this.mouseY = window.innerHeight / 2;
          
          this.painters = new Array();
          
          for (var i = 0; i < 50; i++) {
            this.painters.push({
              dx: window.innerWidth / 2,
              dy: window.innerHeight / 2,
              ax: 0,
              ay: 0,
              div: 0.1,
              ease: Math.random() * 0.2 + 0.6
            });
          }
          
          this.isDrawing = false;
          
          this.interval = setInterval(object.bargs(function(_this) {
            _this.update();
            return false;
          }, this), 1000 / 60);
        },
          
        destroy: function() {
          clearInterval(this.interval);
        },
          
        strokeStart: function(mouseX, mouseY) {
          this.mouseX = mouseX;
          this.mouseY = mouseY;
          
          for (var i = 0; i < this.painters.length; i++) {
            this.painters[i].dx = mouseX;
            this.painters[i].dy = mouseY;
          }
          
          this.shouldDraw = true;
        },
          
        stroke: function(mouseX, mouseY) {
          this.mouseX = mouseX;
          this.mouseY = mouseY;
        },
          
        strokeEnd: function() {},
          
        update: function() {
          var i;
          
          for (i = 0; i < this.painters.length; i++) {
            object.context.beginPath();
            object.context.moveTo(this.painters[i].dx, this.painters[i].dy);
          
            this.painters[i].dx -= this.painters[i].ax = (this.painters[i].ax + (this.painters[i].dx - this.mouseX) * this.painters[i].div) * this.painters[i].ease;
            this.painters[i].dy -= this.painters[i].ay = (this.painters[i].ay + (this.painters[i].dy - this.mouseY) * this.painters[i].div) * this.painters[i].ease;
            object.context.lineTo(this.painters[i].dx, this.painters[i].dy);
            object.context.stroke();
          }
        }
		  },
			web: {
        init: function(context) {
          object.context.strokeStyle = 'rgba(' + object.rgb[0] + ', ' + object.rgb[1] + ', ' + object.rgb[2] + ', 0.5)';
          
          this.points = new Array();
          this.count = 0;
        },
        
        destroy: function() {
        },
        
        strokeStart: function(mouseX, mouseY) {
          this.prevMouseX = mouseX;
          this.prevMouseY = mouseY;
        },
        
        stroke: function(mouseX, mouseY) {
          var i, dx, dy, d;
        
          this.points.push([mouseX, mouseY]);
        
          object.context.beginPath();
          object.context.moveTo(this.prevMouseX, this.prevMouseY);
          object.context.lineTo(mouseX, mouseY);
          object.context.stroke();
        
          object.context.strokeStyle = 'rgba(' + object.rgb[0] + ', ' + object.rgb[1] + ', ' + object.rgb[2] + ', 0.1)';
        
          for (i = 0; i < this.points.length; i++) {
            dx = this.points[i][0] - this.points[this.count][0];
            dy = this.points[i][1] - this.points[this.count][1];
            d = dx * dx + dy * dy;
        
            if (d < 2500 && Math.random() > 0.9) {
              object.context.beginPath();
              object.context.moveTo(this.points[this.count][0], this.points[this.count][1]);
              object.context.lineTo(this.points[i][0], this.points[i][1]);
              object.context.stroke();
            }
          }
        
          this.prevMouseX = mouseX;
          this.prevMouseY = mouseY;
        
          this.count++;
        },
        
        strokeEnd: function() {}
			},
			sketchy: {
        init: function(context) {
          object.context.strokeStyle = 'rgba(' + object.rgb[0] + ', ' + object.rgb[1] + ', ' + object.rgb[2] + ', ' + settings.opacity + ')';
          
          this.points = new Array();
          this.count = 0;
        },

        destroy: function() {},

        strokeStart: function(mouseX, mouseY) {
          this.prevMouseX = mouseX;
          this.prevMouseY = mouseY;
        },

        stroke: function(mouseX, mouseY) {
          var i, dx, dy, d;

          this.points.push([mouseX, mouseY]);

          object.context.beginPath();
          object.context.moveTo(this.prevMouseX, this.prevMouseY);
          object.context.lineTo(mouseX, mouseY);
          object.context.stroke();

          object.context.strokeStyle = 'rgba(' + object.rgb[0] + ', ' + object.rgb[1] + ', ' + object.rgb[2] + ', 0.2)';

          for (i = 0; i < this.points.length; i++) {
            dx = this.points[i][0] - this.points[this.count][0];
            dy = this.points[i][1] - this.points[this.count][1];
            d = dx * dx + dy * dy;

            if (d < 4000 && Math.random() > d / 2000) {
              object.context.beginPath();
              object.context.moveTo(this.points[this.count][0] + (dx * 0.3), this.points[this.count][1] + (dy * 0.3));
              object.context.lineTo(this.points[i][0] - (dx * 0.3), this.points[i][1] - (dy * 0.3));
              object.context.stroke();
            }
          }

          this.prevMouseX = mouseX;
          this.prevMouseY = mouseY;

          this.count++;
        },

        strokeEnd: function() {}
			},
			simple: {
        init: function(context) {
          object.context.strokeStyle = 'rgba(' + object.rgb[0] + ', ' + object.rgb[1] + ', ' + object.rgb[2] + ', ' + settings.opacity + ')';
        },

        destroy: function() {},

        strokeStart: function(mouseX, mouseY, color) {
          this.prevMouseX = mouseX;
          this.prevMouseY = mouseY;
        },

        stroke: function(mouseX, mouseY) {
          object.context.beginPath();
          object.context.moveTo(this.prevMouseX, this.prevMouseY);
          object.context.lineTo(mouseX, mouseY);
          object.context.stroke();

          this.prevMouseX = mouseX;
          this.prevMouseY = mouseY;
        },

        strokeEnd: function() {}
			},
			longfur: {
        init: function(context) {
          object.context.strokeStyle = 'rgba(' + object.rgb[0] + ', ' + object.rgb[1] + ', ' + object.rgb[2] + ', 0.05)';
          
          this.points = new Array();
          this.count = 0;
        },

        destroy: function() {},

        strokeStart: function(mouseX, mouseY) {
        },

        stroke: function(mouseX, mouseY) {
          var i, size, dx, dy, d;

          this.points.push([mouseX, mouseY]);

          for (i = 0; i < this.points.length; i++) {
            size = -Math.random();
            dx = this.points[i][0] - this.points[this.count][0];
            dy = this.points[i][1] - this.points[this.count][1];
            d = dx * dx + dy * dy;

            if (d < 4000 && Math.random() > d / 4000) {
              object.context.beginPath();
              object.context.moveTo(this.points[this.count][0] + (dx * size), this.points[this.count][1] + (dy * size));
              object.context.lineTo(this.points[i][0] - (dx * size) + Math.random() * 2, this.points[i][1] - (dy * size) + Math.random() * 2);
              object.context.stroke();
            }
          }

          this.count++;
        },

        strokeEnd: function() {}
			},
			circles: {
        init: function() {
          object.context.strokeStyle = 'rgba(' + object.rgb[0] + ', ' + object.rgb[1] + ', ' + object.rgb[2] + ', 0.1)';
          this.points = new Array();
        },

        destroy: function() {},

        strokeStart: function(mouseX, mouseY) {
          this.prevMouseX = mouseX;
          this.prevMouseY = mouseY;
        },

        stroke: function(mouseX, mouseY) {
          var i, dx, dy, d, cx, cy, steps, step_delta;

          this.points.push([mouseX, mouseY]);

          dx = mouseX - this.prevMouseX;
          dy = mouseY - this.prevMouseY;
          d = Math.sqrt(dx * dx + dy * dy) * 2;

          cx = Math.floor(mouseX / 100) * 100 + 50;
          cy = Math.floor(mouseY / 100) * 100 + 50;

          steps = Math.floor(Math.random() * 10);
          step_delta = d / steps;

          for (i = 0; i < steps; i++) {
            object.context.beginPath();
            object.context.arc(cx, cy, (steps - i) * step_delta, 0, Math.PI * 2, true);
            object.context.stroke();
          }

          this.prevMouseX = mouseX;
          this.prevMouseY = mouseY;
        },

        strokeEnd: function() {}
			},
			chrome: {
        init: function() {
          object.context.strokeStyle = 'rgba(' + object.rgb[0] + ', ' + object.rgb[1] + ', ' + object.rgb[2] + ', 0.1)';
          
          this.points = new Array();
          this.count = 0;
        },

        destroy: function() {},

        strokeStart: function(mouseX, mouseY) {
          this.prevMouseX = mouseX;
          this.prevMouseY = mouseY;
        },

        stroke: function(mouseX, mouseY) {
          var i, dx, dy, d;

          this.points.push([mouseX, mouseY]);

          object.context.beginPath();
          object.context.moveTo(this.prevMouseX, this.prevMouseY);
          object.context.lineTo(mouseX, mouseY);
          object.context.stroke();

          for (i = 0; i < this.points.length; i++) {
            dx = this.points[i][0] - this.points[this.count][0];
            dy = this.points[i][1] - this.points[this.count][1];
            d = dx * dx + dy * dy;

            if (d < 1000) {
              object.context.strokeStyle = "rgba(" + Math.floor(Math.random() * object.rgb[0]) + ", " + Math.floor(Math.random() * object.rgb[1]) + ", " + Math.floor(Math.random() * object.rgb[2]) + ", 0.1 )";
              object.context.beginPath();
              object.context.moveTo(this.points[this.count][0] + (dx * 0.2), this.points[this.count][1] + (dy * 0.2));
              object.context.lineTo(this.points[i][0] - (dx * 0.2), this.points[i][1] - (dy * 0.2));
              object.context.stroke();
            }
          }

          this.prevMouseX = mouseX;
          this.prevMouseY = mouseY;

          this.count++;
        },

        strokeEnd: function() {}
			},
			squares: {
        init: function(context) {
          object.context.strokeStyle = 'rgba(' + object.rgb[0] + ', ' + object.rgb[1] + ', ' + object.rgb[2] + ', ' + settings.opacity + ')';
          object.context.fillStyle = "rgb(255, 255, 255)";
        },

        destroy: function() {},

        strokeStart: function(mouseX, mouseY, color) {
          this.prevMouseX = mouseX;
          this.prevMouseY = mouseY;
        },

        stroke: function(mouseX, mouseY) {
          var dx, dy, angle, px, py;

          dx = mouseX - this.prevMouseX;
          dy = mouseY - this.prevMouseY;
          angle = 1.57079633;
          px = Math.cos(angle) * dx - Math.sin(angle) * dy;
          py = Math.sin(angle) * dx + Math.cos(angle) * dy;

          object.context.beginPath();
          object.context.moveTo(this.prevMouseX - px, this.prevMouseY - py);
          object.context.lineTo(this.prevMouseX + px, this.prevMouseY + py);
          object.context.lineTo(mouseX + px, mouseY + py);
          object.context.lineTo(mouseX - px, mouseY - py);
          object.context.lineTo(this.prevMouseX - px, this.prevMouseY - py);
          object.context.fill();
          object.context.stroke();

          this.prevMouseX = mouseX;
          this.prevMouseY = mouseY;
        },

        strokeEnd: function() {}
			}
		};
		
		$element.delegate('#canvas', 'mousedown touchstart', function (e) { 		
			var touch = e.originalEvent,
					posX = 0,
					posY = 0;
					
		  if (!e) var e = window.event;
		  if (e.pageX || e.pageY) {
		    posX = e.pageX;
		    posY = e.pageY;
		  } else if (e.clientX || e.clientY) {
		    posX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		    posY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		  }
		  
		  posX = posX - $element.offset().left;
		  posY = posY - $element.offset().top;
					
			draw = true;
			
			styles[settings.style].strokeStart(posX, posY);
		});
		
		$element.delegate('#canvas', 'mouseup touchend', function (e) { 
			draw = false;
			styles[settings.style].strokeEnd();
		});
		
		$element.delegate('#canvas', 'mousemove touchmove', function (e) {
			var touch = e.originalEvent,
					posX = 0,
					posY = 0,
					i, b, a, g;
					
		  if (!e) var e = window.event;
		  if (e.pageX || e.pageY) {
		    posX = e.pageX;
		    posY = e.pageY;
		  } else if (e.clientX || e.clientY) {
		    posX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		    posY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		  }
		  
		  posX = posX - $element.offset().left;
		  posY = posY - $element.offset().top;
		
			if (draw) {
				styles[settings.style].stroke(posX, posY);
			}
		
			return false;
		});
		
		/*$(window).resize(function () {
		  clearTimeout(resizeTimeout);
		  
		  resizeTimeout = setTimeout(function () {
			  object.canvasWidth  = (settings.width == 'fill') ? $element.outerWidth() : settings.width;
			  object.canvasHeight = (settings.height == 'fill') ? $element.outerHeight() : settings.height;
			  
			  object.canvas.width = object.canvasWidth;
			  object.canvas.height = object.canvasHeight;
			}, 1000);
		});*/
		
		this.HexToRgb = (function() {
      var cutHex = function(h) {
        return (h.charAt(0) === "#") ? h.substring(1, 7) : h
      };
      return {
        toR: function(h) {
          return parseInt((cutHex(h)).substring(0, 2), 16)
        },
        toG: function(h) {
          return parseInt((cutHex(h)).substring(2, 4), 16)
        },
        toB: function(h) {
          return parseInt((cutHex(h)).substring(4, 6), 16)
        },
        isHex: function(h) {
          return (h.charAt(0) === "#")
        }
      }
  	})();
	
	}
	
	$.fn.sketchboard = function (options) {
		return this.each(function () {
			var $element = $(this),
					sketchboard;
	
			if ($element.children('.input').data('sketchboard')) return;
	
			sketchboard = new Sketchboard($element.children('.input').get(0), options);
			$element.children('.input').data('sketchboard', sketchboard);
			
			sketchboard.init();
			
			$element.on('brushchanged', function () {	
    	  sketchboard.newSetting('style', $element.attr('data-brush'));
    	});
    	
    	$element.on('sizechanged', function () {	
    	  sketchboard.newSetting('lineWidth', $element.attr('data-size'));
    	});
    	
    	$element.on('colorchanged', function () {
    	  sketchboard.newSetting('color', $element.attr('data-color'));
    	});
		});
	};

})(jQuery);