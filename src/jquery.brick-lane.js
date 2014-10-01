/*!
 * Brick Lane v0.0.4
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
          console.debug( "Cannot call " + namespace + " prior to Brick Lane initialization; " +
            "options: '" + options + "'" );
          continue;
        }
        if ( !$.isFunction( instance[options] ) || options.charAt(0) === '_' ) {
          console.debug( "Method '" + options + "' doesn't exist for " + namespace );
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
         By default, 'auto' will use the first element to calculate the
         width of the columns.
         A function can also be passed instead of a number

         Values: auto|number|function
       */
      columnWidth: 'auto',

      /* The jQuery selector to specify the children elements
         By default, nearest .children() will be used when undefined
         is given.
       */
      itemSelector: undefined,

      /* Binds layout to window resizing */
      isResizeBound: true,

      /* Lay out elements when resize is finished by X ms */
      resizeDelay: 150,

      /* Duration of the transition when items gets added to the layout
         You can use 0 to disable it.
       */
      transitionDuration: 250,

      /* Uses CSS3 transitions when possible */
      useCSS3Transitions: true

    }, options);

    // ---------------------------- plugin -----------------------------

    var BrickLane = function( element, settings ) {
      var $el = $(element),
      elements = [],
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

        // Sets the container position to allow absolute positioning of elements inside
        $el.css('overflow', 'hidden');
        if ($el.css('position') == 'static') {
          $el.css('position', 'relative');
        }

        // Gets the initial group of elements in the container
        var $elements = settings.itemSelector ? $el.find( settings.itemSelector ) : $el.children();
        $elements.each(function() {
          elements.push( $(this) );
        });

        // Sets up the columnWidth to always be a function
        if ( typeof settings.columnWidth === 'function' ) {
          columnWidth = settings.columnWidth;
        } else {
          columnWidth = function() {
            if (settings.columnWidth == 'auto') {
              if (elements.length > 0) {
                columnWidthComputed = elements[0].outerWidth();
              } else {
                columnWidthComputed = 300;
              }
            } else {
              columnWidthComputed = settings.columnWidth;
            }

            return columnWidthComputed;
          };
        }

        // Manually fires the resize event to layout elements
        _onViewportResize();

        // Binds the autolayout on resize, if needed
        if (settings.isResizeBound) {
          _bindResize();
        }

        initialized = true;
      },

      _cleanup = function() {
        // Cleans up the instance
        colYs = [];
        elements = [];
      },

      _destroy = function() {
        _unbindResize();

        $el.removeAttr('style');

        $.each(elements, function() {
          this.removeAttr('style');
        });
      },

      _onViewportResize = function(event) {
        var delay = event === undefined ? 0 : settings.resizeDelay;

        // Clears the current resize timeout. Check few lines below
        if (resizeTimeout) {
          window.clearTimeout(resizeTimeout);
          delete resizeTimeout;
        }

        // Binds the re-layout of elements after some delay to make sure
        // this will only be called once the user ended to resize the window.
        resizeTimeout = window.setTimeout(function() {
          var w = $el.width();
          if (w !== containerWidth) {
            containerWidth = w;
            _relayoutElements();
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
        _appendedElement( $element, true );
      },

      _appendedElement = function( $element, needsToBeAppended ) {
        needsToBeAppended = needsToBeAppended === true;

        // Make sure the given element is a jQuery element
        if ( ! ($element instanceof jQuery) ) {
          $element = $($element);
        }

        // Add the element to our set
        elements.push( $element );

        // If needs to be appended, set-up the element before appending it to the DOM
        if ( needsToBeAppended ) {
          if ( settings.transitionDuration > 0) {
            $element.css('opacity', 0);
          }
        }

        // Lay outs the element
        _layoutElement( $element, needsToBeAppended );
        _adjustViewportHeight();

        // Appear transition (when needed)
        if ( needsToBeAppended && settings.transitionDuration > 0 ) {
          if ( settings.useCSS3Transitions) {
            $element.css( {opacity: 1} );
          } else {
            $element.animate( {opacity: 1}, settings.transitionDuration );
          }
        }
      },

      _layoutElements = function() {
        $.each(elements, function() {
          _layoutElement( this );
        });

        _adjustViewportHeight( true );
      },

      _layoutElement = function( $element, append ) {
        var colSpan = 1,

        // Get the shortest column
        minimumY = Math.min.apply( Math, colYs ),

        // And its index
        shortestColumnIdx = colYs.indexOf( minimumY ),

        // Then just do some simply math to adjust the element position
        data = {
          left: columnWidthComputed * shortestColumnIdx,
          top: minimumY
        };

        // Don't apply absolute positioning more than once - for performances
        if ($element.css('position') !== 'absolute') {
          data.position = 'absolute';
        }

        // Sets the new css styles to the element
        $element.css(data);

        // Check if the element needs to be appended
        if (append === true) {
          $el.append($element);
        }

        // Update the column height with the element we just added to it
        colYs[shortestColumnIdx] += $element.outerHeight(true);
      },

      _relayoutElements = function() {
        _setViewportSize();
        _layoutElements();
      },

      _adjustViewportHeight = function( reduceAllowed ) {
        var maxY = Math.max.apply( Math, colYs ),
            containerHeight = $el.outerHeight(true);

        // Adjust the container height when needed
        if ( reduceAllowed === true || maxY > containerHeight ) {
          $el.css('height', maxY);
        }
      }

      _setViewportSize = function() {
        // Get the width of a single column
        var w = columnWidth();

        // Get the number of columns that can fit into the container
        columnsCount = Math.floor(containerWidth / w + 0.01);

        // Recreate all columns references
        colYs = [];
        for (var i = 0; i < columnsCount; i++) {
          colYs.push(0);
        };
      };

      // ------------------------ public methods ------------------------

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

        layout: function() {
          _relayoutElements();
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