var Daleks = Daleks || {};

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
    placeDalek: function( dalek ) {
      do {
        var pos = _getRandomPosition( this );
      } while (!this.dalekPositionIsLegal( pos ));

      dalek.setPosition( pos.x, pos.y );
      this.place( dalek );
    },

    // not on top of an existing dalek or within 2 of the Doctor
    dalekPositionIsLegal: function( pos ) {
      // check doctor
      // TODO
      // iterate over daleks 
      // TODO
      return true;
    },
    
    // place doctor randomly on board
    placeDoctor: function( doctor ) {
      var pos = _getRandomPosition( this );
      doctor.setPosition( pos.x, pos.y );
      this.place( doctor );
    },

    placeRubble: function( rubble, x, y ) {
      rubble.setPosition( x, y );
      this.place( rubble );
    },

    remove: function( piece ) {
      piece.getEl().remove();
    }
  };

  // --- private static functions ---

  // function _disableInteraction(e) {
  //   e.preventDefault();
  // };

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


