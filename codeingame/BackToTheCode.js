/**
 * Back to the Code - turn-based Qix game on a 35x20 grid
 *
 * 4: 1001 (250)
 * 3: 900  (300)
 * 2: 700  (350)
 */

var Board = (function()
{
  function Board( width, height) {
    this.width = width;
    this.height = height;
    this.squares = [];
  };

  /**
   * top left is (0,0)
   */
  Board.prototype = {
    /**
     * @return {number} player # who occupies this square or null if empty. (we are #0)
     */
    get: function( x, y ) {
      var sq = this.squares[y][x];
      if (sq === ".") {
        return "";
      } else {
        return sq|0;  // convert to number
      }
    },

    /** */
    set: function( x, y, player ) {
      this.squares[y][x] = player;
    },

    /**
     * @return true if all squares in rect are empty or owned by us
     */
    isRectClear: function( rect ) {
      var startX = rect.left;
      for (var x=rect.left; x <= rect.right; x++) {
        for (var y=rect.top; y <= rect.bottom; y++) {
          if (this.get(x,y)) {
            return false;
          }
        }
      }
      return true;
    },

    /**
     * @return true if all squares in rect are owned by us
     */
    isRectClear: function( rect ) {
      var startX = rect.left;
      for (var x=rect.left; x <= rect.right; x++) {
        for (var y=rect.top; y <= rect.bottom; y++) {
          if (this.get(x,y) !== 0) {
            return false;
          }
        }
      }
      return true;
    },

    /**
     *  largest unoccupied rect that has (contains?) (x,y) as a corner
     */
    findLargestRectangle: function( x, y) {
      // start upper left?

      // am I clear?
      if (this.get( x, y )) {
        return null;
      }

      var rect = {
        left: x,
        right: x,
        top: y,
        bottom: y
      };

      // find biggest rect by expanding as far as possible in each direction
      // this works unless
      while (this.isRectClear( rect )) { rect.left++; }   rect.left--;
      while (this.isRectClear( rect )) { rect.right++; }  rect.right--;
      while (this.isRectClear( rect )) { rect.top++; }    rect.top--;
      while (this.isRectClear( rect )) { rect.bottom++; } rect.bottom--;

      // we own this rect already, don't bother
      if (this.isRectOwned( rect )) {
        return null;
      }
      return rect;
    },

    /**
     */
    print: function() {
      for (var y = 0; y < this.height; y++) {
        var buf =  "";
        for (var x = 0; x < this.width; x++) {
          buf += this.get(x,y);
        }
        printErr( buf );
      }
      return buf;
    },

    score: function() {
      // count each player's total squares
      var scores = {};
      for (var y = 0; y < this.height; y++) {
        var buf =  "";
        for (var x = 0; x < this.width; x++) {
          if (!scores[this.get(x,y)]) {
            scores[this.get(x,y)] = 1;
          } else {
            scores[this.get(x,y)]++;
          }
        }
      }
      return scores;
    },

    addRow: function( line ) {
      this.squares.push( line );
/*
     for (var r=0; r < line.length; r++) {
      var square = line.charAt(r);
        if (square === '.') {
        }
      }
*/
    }

  };

  return Board;
})();

var Rectangle = (function()
{
  /**
   *  @param points is array of {x:, y:}
   */
  function Rectangle( points ) {
    this.points = points;

  };

  Rectangle.prototype = {
    visited: function( x,y ) {

    }
  };

  return Rectangle;
})();

function rectContains( rect, x, y ) {
  return ((x >= rect.x) && (x <= rect.y) &&
          (y >= rect.top) && (y <= rect.bottom));
}


var opponentCount = parseInt(readline()); // Opponent count

var taunt = "eat my bubbles";

var dest = { x:0, y:0};  // where we are going
var currentRect;  // the rectangle we're trying to surround
var wandering = false;
var board = null;

// game loop
while (true) {

  var gameRound = parseInt(readline());
  var inputs = readline().split(' ');
  var x = parseInt( inputs[0] ); // Our position
  var y = parseInt( inputs[1] ); // Our y position
  var backInTimeLeft = parseInt( inputs[2] ); // Remaining "back in time"

  // Read opponents' data
  var opponent = [];
  for (var i = 0; i < opponentCount; i++) {
    inputs = readline().split(' ');
    printErr( inputs );
    var oppX = parseInt( inputs[0]|0 ); // X position of the opponent
    var oppY = parseInt( inputs[1]|0 ); // Y position of the opponent
    var oppBITLeft = parseInt( inputs[2]|0 ); // back in time of the opponent

    // update local game state
    if (board) {
      board.set( oppX, oppY, i );
      if (rectContains( rect, oppX, oppY )) {
        // shrink our current rect
        currentRect = null;
      }
    }
  }

  // init board
  if (!board) {
    // Read lines of the map   '.' = free, else id of player (we are "0")
    for (var i = 0; i < 20; i++) {
      var line = readline();
      if (!board) {
        board = new Board( line.length, 20 );
      }
      board.addRow( line );
    }
  }

  board.print();

  //  printErr( JSON.stringify( board.score() ));
  // if losing with a few moves left, go back to the future?

  if (!currentRect) {
    currentRect = board.findLargestSquare();
  }
  if (!currentRect) {
    wandering = true;
  } else {
 //    nextCorner = board.goToNextCorner( rect );
  }

  wandering = true;

  if (wandering) {
    if ((x === dest.x) && (y === dest.y)) {
      dest.x = Math.floor( Math.random() * board.width );
      dest.y = Math.floor( Math.random() * board.height );
    }
  }

  print( dest.x + " " + dest.y + " " + taunt);

  // action: "x y" to move or "BACK rounds" to go back in time
}
