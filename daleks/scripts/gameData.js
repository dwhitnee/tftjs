//----------------------------------------------------------------------
// Game meta data
//----------------------------------------------------------------------
Daleks.GameData = (function( localStorage, JSON )
{
  "use strict";
  function GameData() {

    // this.el = $('<div class="piece ' + className + '"/>');
    // this.hide();   // hide until position set
  }
  
  GameData.prototype = {
    
    setHighScore: function( score ) {
      if (score > this.getHighScore()) {
        _saveHighScore( score );
      }
    },
    
    getHighScore: function() {
      return _getGameData().score || 0;
    }
  };

  // Private functions
  //----------------------------------------
  function _getGameData() {
    var data = localStorage.getItem('highScore');
    if (data) {
      return JSON.parse( data );
    } else {
      return {};
    }
  }
  
  //----------------------------------------
  function _saveHighScore( score ) {
    var data = _getGameData();
    data.score = score;
    
    localStorage.setItem('highScore', JSON.stringify( data ));
  };
 
  return GameData;
})( window.localStorage, window.JSON );
