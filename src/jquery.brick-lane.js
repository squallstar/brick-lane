/*!
 * Brick Lane v0.0.1
 * Hipstery Cascading Grid Layout Library
 * MIT License
 * by Nicholas Valbusa & Paolo Moretti
 */

( function( window, $ ) {

  var namespace = 'BrickLanePlugin';

  $.fn.brickLane = function( options ) {

    // ----------------------- instance generator -----------------------

    if ( typeof options === 'string' ) {
      var args = slice.call( arguments, 1 );

      for ( var i=0, len = this.length; i < len; i++ ) {
        var elem = this[i];
        var instance = $.data( elem, namespace );
        if ( !instance ) {
          logError( "Cannot call " + namespace + " prior to BrickLane initialization; " +
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

    // ---------------------------- helpers ----------------------------

    var isNumeric = function( obj ) {
        return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
    };

    // ---------------------- settings definition ----------------------

    var settings = $.extend({

      /* The width of a single column.
         A function can also be passed instead of a number
       */
      columnWidth: 'auto',

      /* The jQuery selector to specify the children elements */
      itemSelector: undefined

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

      _init = function() {
        if (initialized) {
          _cleanup();
        }

        containerWidth = $el.width();
        console.log('containerWidth', containerWidth);

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

        _bindViewportSize();

        initialized = true;

        $elements.each(function() {
          _layoutElement( $(this), false );
        });

        _adjustViewportHeight();
      },

      _cleanup = function() {
        colYs = [];
      },

      _addElement = function( $element ) {
        $el.append( $element );
      }

      _layoutElement = function( $element, adjustContainerHeight ) {
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

        $element.css({
          position: 'absolute',
          left: position.x,
          top: position.y
        });

        if (adjustContainerHeight !== false) {
          _adjustViewportHeight();
        }
      },

      _adjustViewportHeight = function() {
        var maxY = Math.max.apply( Math, colYs );
        $el.css('height', maxY);
      }

      _bindViewportSize = function() {
        var w = columnWidth();
        columnsCount = Math.floor(containerWidth / w);
        console.log('columns count', columnsCount);

        for (var i = 0; i < columnsCount; i++) {
          if (!colYs[i]) {
            colYs.push(0);
          }
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