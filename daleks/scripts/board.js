//----------------------------------------------------------------------
// div element that can be positioned absolutely and animated.
//----------------------------------------------------------------------
Daleks.Board = (function()
{
  function Board( width, height ) {
    this.width = width || 30;
    this.height = height || 20;

    this.el = $('<div class="board"/>');
  }
  
  Board.prototype = {

    getEl: function() { return this.el; },

    place: function( piece ) {
      piece.draw();   // update css
      this.getEl().append( piece.getEl() );  // add to DOM
    },
    
    // put Dalek somewhere on the board more than one space away from player
    placeDalek: function( dalek, doctor ) {
      do {
        var pos = _getRandomPosition( this );
      } while (!this.dalekPositionIsLegal( pos, doctor ));

      dalek.setPosition( pos );
      this.place( dalek );
    },

    // not on top of an existing dalek or within 2 of the Doctor
    dalekPositionIsLegal: function( pos, doctor ) {
      return (pos.x !== doctor.pos.x) && (pos.y !== doctor.pos.y);
    },
    
    // place doctor randomly on board
    placeDoctor: function( doctor ) {
      doctor.setPosition( _getRandomPosition( this ));
      this.place( doctor );
    },

    placeRubble: function( rubble, pos ) {
      rubble.setPosition( pos );
      this.place( rubble );
    },

    clear: function() {
      this.getEl().empty();
    },
    remove: function( piece ) {
      piece.getEl().remove();
    }
  };

  // --- private static functions ---
  function _getRandomPosition( board ) {
    return {
      x: _getRandom( board.width ),
      y: _getRandom( board.height )
    };
  };

  // Random integer [0, max)
  function _getRandom( max ) {
    return Math.floor( Math.random() * max );
  };
  
  return Board;
})();


