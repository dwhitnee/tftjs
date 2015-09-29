/**
 * Back to the Code - turn-based Qix game on a 35x20 grid
 *
 * 4: 1001 (250)
 * 3: 900  (300)
 * 2: 700  (350)

 * Rating: 35  (#288)
 * Rating: 38  (#170)  check wide and high, no defense or BTFs
 * Rating: 39  (#154-163)  bug fix to ignore our own squares when calculating largest rect
 *   still a bug when stuck on same square with another player
 *   I also don't ignore real estate I already have when calculating largest rect, should be
 *   largestPotentialGainRect
 *   Could add rect short circuit if someone is approaching boundary.  Hard to get right.
 * ALgorithm gets inerrupted a lot, should fail onto smaller rect more gracefully

 * Rating: 38 (#173)  Fixed bug - ignore other player who enters rect but does not take any squares
 * Rating: 36 (#242)  Add diagonal stroke to start.
 * Rating: 37 (#226)  Fix overlap with other player bug (no one gets the square?)
 * Rating: ?36.5 (#214)   Lose the diagonal
 */

function debug( str ) {
  printErr( str );
}

var Board = (function()
{
  function Board( width, height) {
    this.width = width;
    this.height = height;
    this.squares = [];
    for (var x=0; x < width; x++) {
      this.squares[x] = [];
    }
  };

  /**
   * top left is (0,0)
   */
  Board.prototype = {
    /**
     * @return {number} player # who occupies this square or null if empty. (we are #0)
     */
    get: function( x, y ) {
      try {
        return this.squares[x][y];
      }
      catch (e) {
        printErr("Tried to get " + x + ", " + y);
        //printErr( e.stack );
        return undefined;
      }

      // var sq = this.squares[y][x];
      // if (sq === ".") {
      //   return "";
      // } else {
      //   return sq|0;  // convert to number
      // }
    },

    /** */
    set: function( x, y, player, forceSet ) {
      try {
        if (player === ".") {
          player = undefined;
          // } else if ((player === "0") || player === 0) {
          //   player = 9;
        } else {
          player = player|0;  // toInt
        }

        if ((this.squares[x][y] === undefined) || forceSet) {
          this.squares[x][y] = player;
        }
      }
      catch (e) {
        printErr("Trying to set " + x + "," + y + ": " + player);
      }
    },

    /**
     * read an array of strings and update our baord
     */
    update: function( lines ) {
      for (var y=0; y < lines.length; y++) {
        var line = lines[y];
        for (var x=0; x < line.length; x++) {
          this.set(x,y, line.charAt( x ), true );
        }
      }
    },

    /**
     * Find a random empty square (get nearest empty square?  FIXME)
     */
    getRandomSquare: function() {

      if (this.isFull()) {
        return {x:0,y:0};
      }

      var x,y;
      for (;x === undefined || this.get(x, y) !== undefined; ) {
        x = Math.floor( Math.random() * board.width );
        y = Math.floor( Math.random() * board.height );
      };
      debug("Random square: " + x + "," +y);
      return {x:x, y:y };
    },

    /**
     * @return true if all squares in rect are empty or owned by us
     */
    isRectClear: function( rect ) {
      var startX = rect.left;
      for (var x=rect.left; x <= rect.right; x++) {
        for (var y=rect.top; y <= rect.bottom; y++) {
          if (this.get(x,y) > 0) {
            return false;
          }
        }
      }
      return true;
    },

    /**
     * @return true if all squares in rect are owned by us
     */
    isRectOwned: function( rect ) {
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

    isFull: function() {
      for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
          if (this.get(x,y) === undefined) {
            return false;
          }
        }
      }
      return true;
    },


    findWidestRect: function( rect ) {
      for (; rect.left >= 0 && this.isRectClear( rect ); rect.left--) {};          rect.left++;
      for (; rect.right < this.width && this.isRectClear( rect ); rect.right++){}; rect.right--;
      for (; rect.top >= 0 && this.isRectClear( rect ); rect.top--) {};            rect.top++;
      for (; rect.bottom < this.height && this.isRectClear( rect ); rect.bottom++) {}; rect.bottom--;
    },

    findTallestRect: function( rect ) {
      for (; rect.top >= 0 && this.isRectClear( rect ); rect.top--) {};            rect.top++;
      for (; rect.bottom < this.height && this.isRectClear( rect ); rect.bottom++) {}; rect.bottom--;
      for (; rect.left >= 0 && this.isRectClear( rect ); rect.left--) {};          rect.left++;
      for (; rect.right < this.width && this.isRectClear( rect ); rect.right++){}; rect.right--;
    },

    /**
     *  largest unoccupied rect that has (contains?) (x,y) as a corner
     *  This isn't really largest, it is largest and widest.
     * FIXME: This needs to take other shapes into account
     */
    findLargestRectangle: function( x, y) {
      var outRect;

      debug("Finding Largest rect ====");

      // am I clear?
      if (this.get( x, y )) {
        return null;
      }

      var wideRect = new Rectangle( x,y, x,y );
      var tallRect = new Rectangle( x,y, x,y );

      // find biggest rect by expanding as far as possible in each direction

      this.findWidestRect( wideRect );
      this.findTallestRect( tallRect );

      // if we own these rects already, don't bother
      if (this.isRectOwned( wideRect )) {
        wideRect = null;
      }
      if (this.isRectOwned( tallRect )) {
        tallRect = null;
      }

      outRect = wideRect;
      if (tallRect && tallRect.biggerThan( wideRect )) {
        outRect = tallRect;
      }

      debug("Largest rect is " +
            (outRect ? outRect.toString() : " nothin") );
      return outRect;
    },

    /**
     * go around perimeter of rect and find next empty square we should aim for
     */
    getNextOpenSquare: function( rect ) {
      var x, y;

      // across top
      for (x=rect.left, y=rect.top; x <= rect.right; x++) {
        if (this.get(x,y) === undefined) {
          return { x:x, y:y };
        }
      }

      // down right side
      for (x=rect.right, y=rect.top; y <= rect.bottom; y++) {
        if (this.get(x,y) === undefined) {
          return { x:x, y:y };
        }
      }

      // back across bottom
      for (x=rect.right, y=rect.bottom; x >= rect.left; x--) {
        if (this.get(x,y) === undefined) {
          return { x:x, y:y };
        }
      }

      // up left side
      for (x=rect.left, y=rect.bottom; y >= rect.top; y--) {
        if (this.get(x,y) === undefined) {
          return { x:x, y:y };
        }
      }

      // never found an empty square
      debug("WTF? " + rect.toString());
      return {x:0, y:0};
    },

    /**
     */
    print: function() {
      for (var y = 0; y < this.height; y++) {
        var buf =  "";
        for (var x = 0; x < this.width; x++) {
          var sq = this.get(x,y);
          if (sq === undefined) {
            sq = ".";
          }
          buf += sq;
        }
        debug( buf );
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



/**
 * Basic Rectangle defined by upper left and lower right
 * (0,0) is upper left
 */
var Rectangle = (function()
{
  /**
   */
  function Rectangle( left, top, right, bottom ) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;

  };

  Rectangle.prototype = {
    contains: function( x, y ) {
      return ((x >= this.left) && (x <= this.right) &&
              (y >= this.top) && (y <= this.bottom));
    },

    area: function() {
      return (1 + this.right - this.left) * (1 + this.bottom - this.top);
    },

    biggerThan: function( rect ) {
      if (!rect) {
        return true;
      }
      return this.area() > rect.area();
    },

    toString: function() {
      return "[" + this.left + "," + this.top + "], [" + this.right + "," +this.bottom + "]";
    }
  };

  return Rectangle;
})();



//----------------------------------------------------------------------
//----------------------------------------------------------------------
var opponentCount = parseInt(readline()); // Opponent count

var taunt = "eat my bubbles";

var board =  new Board( 35, 20 );   // board is always 35x20

var dest = { x:0, y:0};   // where we are going
var last = {x:100,y:100}; // last place we went
var currentRect;          // the rectangle we're trying to surround
var wandering = false;
var turn = 0;

var starting = true;
var drawingDiagonal = false;
var diagVec = { x:1, y:1 };

var bitsLeft = [1,1,1,1,1,1,1];   // Back In Times left

// game loop
try {
while (true) {
  turn++;

  var gameRound = parseInt(readline());
  var inputs = readline().split(' ');
  var x = parseInt( inputs[0] ); // Our x position
  var y = parseInt( inputs[1] ); // Our y position
  var backInTimeLeft = parseInt( inputs[2] ); // Remaining "back in time"

  // we didn't move, nudge!
  if ((x === last.x) && (y === last.y)) {
    currentRect = null;
  }
  last = {x:x, y:y};

  board.set( x, y, 0 );

  // Read opponents' data
  var opponent = [];
  for (var i = 0; i < opponentCount; i++) {
    inputs = readline().split(' ');
    // debug( inputs );
    var oppX = parseInt( inputs[0]|0 ); // X position of the opponent
    var oppY = parseInt( inputs[1]|0 ); // Y position of the opponent
    var oppBITLeft = parseInt( inputs[2]|0 ); // back in time of the opponent

    if (bitsLeft[i] != oppBITLeft) {   // someone went back in time!  panic!
      bitsLeft[i] = oppBITLeft;
      taunt = "Sneaky!";
      currentRect = null;  // recalc best move post time warp
    } else {
      taunt = "eat my bubbles";
    }

    // negative if they quit
    if (oppX >= 0) {
      // update local game state
      board.set( oppX, oppY, i+1 );

      if ((board.get( oppX, oppY ) !== 0 ) &&
        currentRect && currentRect.contains( oppX, oppY ))
      {
        printErr("Doh! player " + i + ": (" + oppX + "," + oppY +") entered our Rect: " +
                 currentRect.toString());
        // shrink our current rect
        currentRect = null;
      }
    }
  }

  // read board even though we don't care
  // Read lines of the map   '.' = free, else id of player (we are "0")
  var lines = [];
  for (i = 0; i < 20; i++) {
    lines.push( readline() );
  }
  board.update( lines );

  // debug("BOARD");
  // board.print();

  //  printErr( JSON.stringify( board.score() ));
  // if losing with a few moves left, go back to the future?

  // Start aggressive with a large diagonal to mess up others
  if (starting) {
    starting = false;
    dest = {x:x, y:y};

    // make longest diagonal
    if (2*x > board.width) {
      diagVec.x = -1;
    }
    if (2*y > board.height) {
      diagVec.y = -1;
    }
  }

  // move diagonally until we hit an edge
  if (drawingDiagonal) {
    if ((dest.x === 0) || (dest.x === 34) ||
        (dest.y === 0) || (dest.y === 19))
    {
      drawingDiagonal = false;

    } else {
      if (turn % 2) {
        dest.x += diagVec.x;
      } else {
        dest.y += diagVec.y;
      }
      print( dest.x + " " + dest.y + " " + taunt);
      continue;
    }
  }

  if (!currentRect) {
    currentRect = board.findLargestRectangle( x, y );
  }

  if (!currentRect) {
    wandering = true;
  } else {
    wandering = false;

    if (!board.isRectOwned( currentRect )) {
      dest = board.getNextOpenSquare( currentRect );
    } else {
      wandering = true;
    }
  }

  if (wandering) {
    // try to find a new rect
    currentRect = board.findLargestRectangle( x, y );
    if (currentRect) {
      wandering = false;
      dest = board.getNextOpenSquare( currentRect );
    } else {
      wandering = true;
    }
  }

  if (wandering) {
    if (!dest) {
      dest = board.getRandomSquare();
    }

    if ((x === dest.x) && (y === dest.y)) {
      dest = board.getRandomSquare();
    }
  }

  if (currentRect) {
    debug("Rect: " + currentRect.toString());
  } else {
    debug("Wandering lost in the wilderness");
  }

  print( dest.x + " " + dest.y + " " + taunt);

  // action: "x y" to move or "BACK rounds" to go back in time
}

} catch (e) {
  printErr("Error: " + e);
  printErr(e.stack);
}
