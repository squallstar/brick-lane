/*!
 * Brick Lane v0.0.1
 * Hipstery Cascading Grid Layout Library
 * MIT License
 * by Nicholas Valbusa & Paolo Moretti
 */

( function( window, $ ) {

  var namespace = 'BrickLanePlugin';

  $.fn.brickLane = function( options ) {

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

    var settings = $.extend({
      columnWidth: 200,
      itemSelector: undefined
    }, options);

    var BrickLane = function(element, settings ) {
      var $el = $(element),
          $elements = undefined

      var _init = function() {
        $elements = settings.itemSelector ? $el.find(settings.itemSelector) : $el.children();
      };

      return {
        initialize: function() {
          _init();
          console.debug('initial elements', $elements);
        }
      }
    };

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