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
      columnWidth: 200,

      /* The jQuery selector to specify the children elements */
      itemSelector: undefined

    }, options);

    // ---------------------------- plugin -----------------------------

    var BrickLane = function( element, settings ) {
      var $el = $(element),
      $elements = undefined,
      columnWidth = undefined,
      containerWidth = undefined,
      initialized = false,

      _init = function() {
        if (initialized) {
          _cleanup();
        }

        containerWidth = $el.width();

        $elements = settings.itemSelector ? $el.find( settings.itemSelector ) : $el.children();

        if ( typeof settings.columnWidth === 'function' ) {
          columnWidth = settings.columnWidth;
        } else {
          columnWidth = function() {
            return settings.columnWidth;
          };
        }

        initialized = true;

        $elements.each(function() {
          _appendedElement( $(this) );
        });
      },

      _cleanup = function() {
        // todo
      },

      _addElement = function( $element ) {
        $el.append( $element );
      }

      _appendedElement = function( $element ) {
        console.debug('appended', $element);

        var width = $element.outerWidth(),
            height = $element.outerHeight();

        $element.css({
          position: 'absolute'
        });
      };

      return {
        initialize: function() {
          _init();
          console.debug('initial elements', $elements);
        },

        setOptions: function( options ) {
          settings = options;
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
        console.debug('creating new instance', this, settings);
        instance = new BrickLane(this, settings);
        $.data( this, namespace, instance );
      }

      instance.initialize();
    });

  };

})( window, jQuery );