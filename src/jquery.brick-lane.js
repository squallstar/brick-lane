/*!
 * Brick Lane v0.0.1
 * Hipstery Cascading Grid Layout Library
 * MIT License
 * by Nicholas Valbusa
 */

( function( window, $ ) {

  var namespace = 'BrickLanePlugin';

  $.fn.brickLane = function( options ) {

    // ----------------------- instance generator -----------------------

    if ( typeof options === 'string' ) {
      var args = $.extend([], arguments);
      args.shift();

      for ( var i=0, len = this.length; i < len; i++ ) {
        var elem = this[i];
        var instance = $.data( elem, namespace );
        if ( !instance ) {
          logError( "Cannot call " + namespace + " prior to Brick Lane initialization; " +
            "options: '" + options + "'" );
          continue;
        }
        if ( !$.isFunction( instance[options] ) || options.charAt(0) === '_' ) {
          logError( "Method '" + options + "' doesn't exist for " + namespace );
          continue;
        }

        var returnValue = instance[ options ].apply( instance, args );

        if ( returnValue !== undefined ) {
          return returnValue;
        }
      }

      return this;
    }

    // ---------------------- settings definition ----------------------

    var settings = $.extend({

      /* The width of a single column.
         A function can also be passed instead of a number
       */
      columnWidth: 'auto',

      /* The jQuery selector to specify the children elements */
      itemSelector: undefined,

      /* Binds layout to window resizing */
      isResizeBound: true,

      /* Lay out elements when resize is finished by X ms */
      resizeDelay: 200

    }, options);

    // ---------------------------- plugin -----------------------------

    var BrickLane = function( element, settings ) {
      var $el = $(element),
      $elements = undefined,
      columnWidth = undefined,
      columnWidthComputed = 0,
      columnsCount = 1,
      colYs = [],
      containerWidth = undefined,
      initialized = false,
      resizeTimeout = undefined

      _init = function() {
        if (initialized) {
          _cleanup();
        }

        $el.css('overflow', 'hidden');
        if ($el.css('position') == 'static') {
          $el.css('position', 'relative');
        }

        $elements = settings.itemSelector ? $el.find( settings.itemSelector ) : $el.children();

        if ( typeof settings.columnWidth === 'function' ) {
          columnWidth = settings.columnWidth;
        } else {
          columnWidth = function() {
            if (settings.columnWidth == 'auto') {
              if ($elements.size() > 0) {
                columnWidthComputed = $elements.first().outerWidth();
              } else {
                columnWidthComputed = 300;
              }
            } else {
              columnWidthComputed = settings.columnWidth;
            }

            return columnWidthComputed;
          };
        }

        _onViewportResize();

        if (settings.isResizeBound) {
          _bindResize();
        }

        initialized = true;
      },

      _cleanup = function() {
        colYs = [];
      },

      _destroy = function() {
        _unbindResize();

        $el.removeAttr('style');

        $elements.each(function() {
          $(this).removeAttr('style');
        });
      },

      _onViewportResize = function(event) {
        var delay = event === undefined ? 0 : settings.resizeDelay;

        if (resizeTimeout) {
          window.clearTimeout(resizeTimeout);
          delete resizeTimeout;
        }

        resizeTimeout = window.setTimeout(function() {
          var w = $el.width();
          if (w !== containerWidth) {
            containerWidth = w;
            _setViewportSize();
            _layoutElements();
          }
        }, delay);
      },

      _bindResize = function() {
        $(window).on("resize", _onViewportResize);
      },

      _unbindResize = function() {
        $(window).off("resize", _onViewportResize);
      },

      _addElement = function( $element ) {
        if ( ! ($element instanceof jQuery) ) {
          $element = $($element);
        }

        $element.css('opacity', 0);

        _layoutElement( $element, true );
        _adjustViewportHeight();

        $element.animate( {opacity: 1}, 200 );
      },

      _layoutElements = function() {
        $elements.each(function() {
          _layoutElement( $(this) );
        });

        _adjustViewportHeight( true );
      }

      _layoutElement = function( $element, append ) {
        var colSpan = 1,
            minimumY = Math.min.apply( Math, colYs ),
            shortestColumnIdx = colYs.indexOf( minimumY ),
            position = {
              x: columnWidthComputed * shortestColumnIdx,
              y: minimumY
            };

        data = {
          left : position.x,
          top: position.y
        };

        if ($element.css('position') !== 'absolute') {
          data.position = 'absolute';
        }

        $element.css(data);

        if (append === true) {
          $el.append($element);
        }

        colYs[shortestColumnIdx] += $element.outerHeight(true);
      },

      _adjustViewportHeight = function( reduceAllowed ) {
        var maxY = Math.max.apply( Math, colYs ),
            containerHeight = $el.outerHeight(true);

        if ( reduceAllowed === true || maxY > containerHeight ) {
          $el.css('height', maxY);
        }
      }

      _setViewportSize = function() {
        var w = columnWidth();
        columnsCount = Math.floor(containerWidth / w + 0.01);

        colYs = [];

        for (var i = 0; i < columnsCount; i++) {
          colYs.push(0);
        };
      };

      return {
        initialize: function() {
          _init();
        },

        setOptions: function( options ) {
          settings = options;
        },

        appended: function ( $element ) {
          _appendedElement( $element );
        },

        append: function ( $element ) {
          _addElement( $element );
        },

        destroy: function (){
          _destroy();
        }
      }
    };

    // ----------------------- jquery plugin init ----------------------

    return this.each(function() {
      var instance = $.data( this, namespace );

      if (instance) {
        instance.setOptions( settings );
      } else {
        instance = new BrickLane(this, settings);
        $.data( this, namespace, instance );
      }

      instance.initialize();
    });

  };

})( window, jQuery );