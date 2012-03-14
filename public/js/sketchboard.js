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
	
			if ($element.children('.inner').data('sketchboard')) return;
	
			sketchboard = new Sketchboard($element.children('.inner').get(0), options);
			$element.children('.inner').data('sketchboard', sketchboard);
			
			sketchboard.init();
			
			$element.on('change', '.brush-style', function () {	
    	  sketchboard.newSetting('style', $(this).val());
    	});
    	
    	$element.on('change', '.brush-size', function () {	
    	  sketchboard.newSetting('lineWidth', $(this).val());
    	});
    	
    	$element.find('.colorpick').each(function () {
        var type  = ($(this).attr('class').split(' ')[1] == 'background') ? 'bgcolor' : 'color', 
  					color = sketchboard.getSetting(type),
  					$this = $(this);
  					
  			$this.css('background-color', color);
  			
  			$(this).ColorPicker({color: color, onSubmit: function (hsb, hex, rgb, el) {
  				sketchboard.newSetting(type, '#' + hex);
  				
  				if ($this.attr('class').split(' ')[1] == 'background') {
  				  $element.children('.inner').css('background-color', '#' + hex);
  				  $element.removeClass('transparent');
  				}
  				
  				$this.css('background-color', '#' + hex);
  				$('.colorpicker').hide();
  			}});
    	});
		});
	};

})(jQuery);

(function(a){var b=function(){var b={},c,d=65,e,f='<div class="colorpicker"><div class="colorpicker_color"><div><div></div></div></div><div class="colorpicker_hue"><div></div></div><div class="colorpicker_new_color"></div><div class="colorpicker_current_color"></div><div class="colorpicker_hex"><input type="text" maxlength="6" size="6" /></div><div class="colorpicker_rgb_r colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_g colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_h colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_s colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_submit"></div></div>',g={eventName:"click",onShow:function(){},onBeforeShow:function(){},onHide:function(){},onChange:function(){},onSubmit:function(){},color:"ff0000",livePreview:true,flat:false},h=function(b,c){var d=O(b);a(c).data("colorpicker").fields.eq(1).val(d.r).end().eq(2).val(d.g).end().eq(3).val(d.b).end()},i=function(b,c){a(c).data("colorpicker").fields.eq(4).val(b.h).end().eq(5).val(b.s).end().eq(6).val(b.b).end()},j=function(b,c){a(c).data("colorpicker").fields.eq(0).val(Q(b)).end()},k=function(b,c){a(c).data("colorpicker").selector.css("backgroundColor","#"+Q({h:b.h,s:100,b:100}));a(c).data("colorpicker").selectorIndic.css({left:parseInt(150*b.s/100,10),top:parseInt(150*(100-b.b)/100,10)})},l=function(b,c){a(c).data("colorpicker").hue.css("top",parseInt(150-150*b.h/360,10))},m=function(b,c){a(c).data("colorpicker").currentColor.css("backgroundColor","#"+Q(b))},n=function(b,c){a(c).data("colorpicker").newColor.css("backgroundColor","#"+Q(b))},o=function(b){var c=b.charCode||b.keyCode||-1;if(c>d&&c<=90||c==32){return false}var e=a(this).parent().parent();if(e.data("colorpicker").livePreview===true){p.apply(this)}},p=function(b){var c=a(this).parent().parent(),d;if(this.parentNode.className.indexOf("_hex")>0){c.data("colorpicker").color=d=M(K(this.value))}else if(this.parentNode.className.indexOf("_hsb")>0){c.data("colorpicker").color=d=I({h:parseInt(c.data("colorpicker").fields.eq(4).val(),10),s:parseInt(c.data("colorpicker").fields.eq(5).val(),10),b:parseInt(c.data("colorpicker").fields.eq(6).val(),10)})}else{c.data("colorpicker").color=d=N(J({r:parseInt(c.data("colorpicker").fields.eq(1).val(),10),g:parseInt(c.data("colorpicker").fields.eq(2).val(),10),b:parseInt(c.data("colorpicker").fields.eq(3).val(),10)}))}if(b){h(d,c.get(0));j(d,c.get(0));i(d,c.get(0))}k(d,c.get(0));l(d,c.get(0));n(d,c.get(0));c.data("colorpicker").onChange.apply(c,[d,Q(d),O(d)])},q=function(b){var c=a(this).parent().parent();c.data("colorpicker").fields.parent().removeClass("colorpicker_focus")},r=function(){d=this.parentNode.className.indexOf("_hex")>0?70:65;a(this).parent().parent().data("colorpicker").fields.parent().removeClass("colorpicker_focus");a(this).parent().addClass("colorpicker_focus")},s=function(b){var c=a(this).parent().find("input").focus();var d={el:a(this).parent().addClass("colorpicker_slider"),max:this.parentNode.className.indexOf("_hsb_h")>0?360:this.parentNode.className.indexOf("_hsb")>0?100:255,y:b.clientY,field:c,val:parseInt(c.val(),10),preview:a(this).parent().parent().data("colorpicker").livePreview};a(document).bind("mouseup",d,u);a(document).bind("mousemove",d,t)},t=function(a){a.data.field.val(Math.max(0,Math.min(a.data.max,parseInt(a.data.val+a.clientY-a.data.y,10))));if(a.data.preview){p.apply(a.data.field.get(0),[true])}return false},u=function(b){p.apply(b.data.field.get(0),[true]);b.data.el.removeClass("colorpicker_slider").find("input").focus();a(document).unbind("mouseup",u);a(document).unbind("mousemove",t);return false},v=function(b){b.preventDefault();var c={cal:a(this).parent(),y:a(this).offset().top};c.preview=c.cal.data("colorpicker").livePreview;a(document).bind("mouseup touchend",c,x);a(document).bind("mousemove touchmove",c,w)},w=function(a){var b=a;if(typeof event!=="undefined"&&event.touches){b=event.touches[0]}p.apply(a.data.cal.data("colorpicker").fields.eq(4).val(parseInt(360*(150-Math.max(0,Math.min(150,b.clientY-a.data.y)))/150,10)).get(0),[a.data.preview]);return false},x=function(b){h(b.data.cal.data("colorpicker").color,b.data.cal.get(0));j(b.data.cal.data("colorpicker").color,b.data.cal.get(0));a(document).unbind("mouseup touchend",x);a(document).unbind("mousemove touchmove",w);return false},y=function(b){b.preventDefault();var c={cal:a(this).parent(),pos:a(this).offset()};c.preview=c.cal.data("colorpicker").livePreview;a(document).bind("mouseup touchend",c,A);a(document).bind("mousemove touchmove",c,z)},z=function(a){var b=a;if(typeof event!=="undefined"&&event.touches){b=event.touches[0]}p.apply(a.data.cal.data("colorpicker").fields.eq(6).val(parseInt(100*(150-Math.max(0,Math.min(150,b.clientY-a.data.pos.top)))/150,10)).end().eq(5).val(parseInt(100*Math.max(0,Math.min(150,b.clientX-a.data.pos.left))/150,10)).get(0),[a.data.preview]);return false},A=function(b){h(b.data.cal.data("colorpicker").color,b.data.cal.get(0));j(b.data.cal.data("colorpicker").color,b.data.cal.get(0));a(document).unbind("mouseup touchend",A);a(document).unbind("mousemove touchmove",z);return false},B=function(b){a(this).addClass("colorpicker_focus")},C=function(b){a(this).removeClass("colorpicker_focus")},D=function(b){var c=a(this).parent();var d=c.data("colorpicker").color;c.data("colorpicker").origColor=d;m(d,c.get(0));c.data("colorpicker").onSubmit(d,Q(d),O(d),c.data("colorpicker").el)},E=function(b){var c=a("#"+a(this).data("colorpickerId"));c.data("colorpicker").onBeforeShow.apply(this,[c.get(0)]);var d=a(this).offset();var e=H();var f=d.top+this.offsetHeight;var g=d.left;if(f+176>e.t+e.h){f-=this.offsetHeight+176}if(g+356>e.l+e.w){g-=356}c.css({left:g+"px",top:f+"px"});if(c.data("colorpicker").onShow.apply(this,[c.get(0)])!=false){c.show()}a(document).bind("mousedown",{cal:c},F);return false},F=function(b){if(!G(b.data.cal.get(0),b.target,b.data.cal.get(0))){if(b.data.cal.data("colorpicker").onHide.apply(this,[b.data.cal.get(0)])!=false){b.data.cal.hide()}a(document).unbind("mousedown",F)}},G=function(a,b,c){if(a==b){return true}if(a.contains){return a.contains(b)}if(a.compareDocumentPosition){return!!(a.compareDocumentPosition(b)&16)}var d=b.parentNode;while(d&&d!=c){if(d==a)return true;d=d.parentNode}return false},H=function(){var a=document.compatMode=="CSS1Compat";return{l:window.clientXOffset||(a?document.documentElement.scrollLeft:document.body.scrollLeft),t:window.clientYOffset||(a?document.documentElement.scrollTop:document.body.scrollTop),w:window.innerWidth||(a?document.documentElement.clientWidth:document.body.clientWidth),h:window.innerHeight||(a?document.documentElement.clientHeight:document.body.clientHeight)}},I=function(a){return{h:Math.min(360,Math.max(0,a.h)),s:Math.min(100,Math.max(0,a.s)),b:Math.min(100,Math.max(0,a.b))}},J=function(a){return{r:Math.min(255,Math.max(0,a.r)),g:Math.min(255,Math.max(0,a.g)),b:Math.min(255,Math.max(0,a.b))}},K=function(a){var b=6-a.length;if(b>0){var c=[];for(var d=0;d<b;d++){c.push("0")}c.push(a);a=c.join("")}return a},L=function(a){var a=parseInt(a.indexOf("#")>-1?a.substring(1):a,16);return{r:a>>16,g:(a&65280)>>8,b:a&255}},M=function(a){return N(L(a))},N=function(a){var b={h:0,s:0,b:0};var c=Math.min(a.r,a.g,a.b);var d=Math.max(a.r,a.g,a.b);var e=d-c;b.b=d;if(d!=0){}b.s=d!=0?255*e/d:0;if(b.s!=0){if(a.r==d){b.h=(a.g-a.b)/e}else if(a.g==d){b.h=2+(a.b-a.r)/e}else{b.h=4+(a.r-a.g)/e}}else{b.h=-1}b.h*=60;if(b.h<0){b.h+=360}b.s*=100/255;b.b*=100/255;return b},O=function(a){var b={};var c=Math.round(a.h);var d=Math.round(a.s*255/100);var e=Math.round(a.b*255/100);if(d==0){b.r=b.g=b.b=e}else{var f=e;var g=(255-d)*e/255;var h=(f-g)*(c%60)/60;if(c==360)c=0;if(c<60){b.r=f;b.b=g;b.g=g+h}else if(c<120){b.g=f;b.b=g;b.r=f-h}else if(c<180){b.g=f;b.r=g;b.b=g+h}else if(c<240){b.b=f;b.r=g;b.g=f-h}else if(c<300){b.b=f;b.g=g;b.r=g+h}else if(c<360){b.r=f;b.g=g;b.b=f-h}else{b.r=0;b.g=0;b.b=0}}return{r:Math.round(b.r),g:Math.round(b.g),b:Math.round(b.b)}},P=function(b){var c=[b.r.toString(16),b.g.toString(16),b.b.toString(16)];a.each(c,function(a,b){if(b.length==1){c[a]="0"+b}});return c.join("")},Q=function(a){return P(O(a))},R=function(){var b=a(this).parent();var c=b.data("colorpicker").origColor;b.data("colorpicker").color=c;h(c,b.get(0));j(c,b.get(0));i(c,b.get(0));k(c,b.get(0));l(c,b.get(0));n(c,b.get(0))};return{init:function(b){b=a.extend({},g,b||{});if(typeof b.color=="string"){b.color=M(b.color)}else if(b.color.r!=undefined&&b.color.g!=undefined&&b.color.b!=undefined){b.color=N(b.color)}else if(b.color.h!=undefined&&b.color.s!=undefined&&b.color.b!=undefined){b.color=I(b.color)}else{return this}return this.each(function(){if(!a(this).data("colorpickerId")){var c=a.extend({},b);c.origColor=b.color;var d="collorpicker_"+parseInt(Math.random()*1e3);a(this).data("colorpickerId",d);var e=a(f).attr("id",d);if(c.flat){e.appendTo(this).show()}else{e.appendTo(document.body)}c.fields=e.find("input").bind("keyup",o).bind("change",p).bind("blur",q).bind("focus",r);e.find("span").bind("mousedown touchstart",s).end().find(">div.colorpicker_current_color").bind("click",R);c.selector=e.find("div.colorpicker_color").bind("touchstart mousedown",y);c.selectorIndic=c.selector.find("div div");c.el=this;c.hue=e.find("div.colorpicker_hue div");e.find("div.colorpicker_hue").bind("mousedown touchstart",v);c.newColor=e.find("div.colorpicker_new_color");c.currentColor=e.find("div.colorpicker_current_color");e.data("colorpicker",c);e.find("div.colorpicker_submit").bind("mouseenter touchstart",B).bind("mouseleave touchend",C).bind("click",D);h(c.color,e.get(0));i(c.color,e.get(0));j(c.color,e.get(0));l(c.color,e.get(0));k(c.color,e.get(0));m(c.color,e.get(0));n(c.color,e.get(0));if(c.flat){e.css({position:"relative",display:"block"})}else{a(this).bind(c.eventName,E)}}})},showPicker:function(){return this.each(function(){if(a(this).data("colorpickerId")){E.apply(this)}})},hidePicker:function(){return this.each(function(){if(a(this).data("colorpickerId")){a("#"+a(this).data("colorpickerId")).hide()}})},setColor:function(b){if(typeof b=="string"){b=M(b)}else if(b.r!=undefined&&b.g!=undefined&&b.b!=undefined){b=N(b)}else if(b.h!=undefined&&b.s!=undefined&&b.b!=undefined){b=I(b)}else{return this}return this.each(function(){if(a(this).data("colorpickerId")){var c=a("#"+a(this).data("colorpickerId"));c.data("colorpicker").color=b;c.data("colorpicker").origColor=b;h(b,c.get(0));i(b,c.get(0));j(b,c.get(0));l(b,c.get(0));k(b,c.get(0));m(b,c.get(0));n(b,c.get(0))}})}}}();a.fn.extend({ColorPicker:b.init,ColorPickerHide:b.hidePicker,ColorPickerShow:b.showPicker,ColorPickerSetColor:b.setColor})})(jQuery)