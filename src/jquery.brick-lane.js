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
      var args = arguments.slice( 1 );

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
      isResizeBound: true

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
            console.log('columnWidthComputed', columnWidthComputed);
            return columnWidthComputed;
          };
        }

        _onViewportResize(0);

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

      _onViewportResize = function(delay) {
        if (resizeTimeout) {
          window.clearTimeout(resizeTimeout);
          delete resizeTimeout;
        }

        window.setTimeout(function() {
          var w = $el.width();
          console.log(w, containerWidth);
          if (w !== containerWidth) {
            containerWidth = w;
            _setViewportSize();
            _layoutElements();
          }
        }, delay ? delay : 50);
      },

      _bindResize = function() {
        $(window).on("resize", _onViewportResize);
      },

      _unbindResize = function() {
        $(window).off("resize", _onViewportResize);
      },

      _addElement = function( $element ) {
        $el.append( $element );
        _layoutElement( $element );
      },

      _layoutElements = function() {
        $elements.each(function() {
          _layoutElement( $(this) );
        });

        _adjustViewportHeight();
      }

      _layoutElement = function( $element ) {
        var width = $element.outerWidth(),
            height = $element.outerHeight(true);

        console.log('---');
        console.log('element size', width, height);

        var colSpan = 1;
        var minimumY = Math.min.apply( Math, colYs );

        console.log('min y', minimumY, 'from', colYs);

        var shortestColumnIdx = colYs.indexOf( minimumY );

        console.log('shortest column index:', shortestColumnIdx);

        var position = {
          x: columnWidthComputed * shortestColumnIdx,
          y: minimumY
        };

        console.log('position to use:', position);

        colYs[shortestColumnIdx] += height;

        console.log('new columns heights', colYs);

        data = {
          left : position.x,
          top: position.y
        };

        if ($element.css('position') !== 'absolute') {
          data.position = 'absolute';
        }

        $element.css(data);
      },

      _adjustViewportHeight = function() {
        var maxY = Math.max.apply( Math, colYs );
        $el.css('height', maxY);
      }

      _setViewportSize = function() {
        var w = columnWidth();
        columnsCount = Math.floor(containerWidth / w);
        console.log('columns count', columnsCount);

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
        console.debug('calling instance');
        instance.setOptions( settings );
      } else {
        instance = new BrickLane(this, settings);
        $.data( this, namespace, instance );
      }

      instance.initialize();
    });

  };

})( window, jQuery );