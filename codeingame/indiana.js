/**
 * Indiana challenge on codingame.com
 *
 * 2015, dwhitnee@gmail.com
 */
/*global print, printErr, readline */

/**
 *  Array.includes polyfill
 */
if (![].includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) {
        return true;
      }
      k++;
    }
    return false;
  };
}




// absolute positions on a room
var TOP = "TOP";
var BOTTOM = "BOTTOM";
var LEFT = "LEFT";
var RIGHT = "RIGHT";

/**
 * Room object that containst the legal paths through itself.
 */
var Room = (function() {
  /**
   * @param type [0-13]
   * @param paths routes into and out of room (list of dir pairs)
   */
  function Room( inType ) {
    this.type = inType;
    this.paths = [];
    switch (inType) {
      case  0: this.paths = []; break;
      case  1: this.paths = [[TOP,BOTTOM], [LEFT,BOTTOM], [RIGHT,BOTTOM]]; break;
      case  2: this.paths = [[LEFT,RIGHT], [RIGHT,LEFT]]; break;
      case  3: this.paths = [[TOP,BOTTOM]]; break;
      case  4: this.paths = [[TOP,LEFT],   [RIGHT,BOTTOM]]; break;
      case  5: this.paths = [[TOP,RIGHT],  [LEFT,BOTTOM]]; break;
      case  6: this.paths = [[LEFT,RIGHT], [RIGHT,LEFT]]; break;
      case  7: this.paths = [[TOP,BOTTOM], [RIGHT,BOTTOM]]; break;
      case  8: this.paths = [[LEFT,BOTTOM],[RIGHT,BOTTOM]]; break;
      case  9: this.paths = [[TOP,BOTTOM], [LEFT,BOTTOM]]; break;
      case 10: this.paths = [[TOP,LEFT]];     break;
      case 11: this.paths = [[TOP,RIGHT]];    break;
      case 12: this.paths = [[RIGHT,BOTTOM]]; break;
      case 13: this.paths = [[LEFT,BOTTOM]];  break;
    default: throw new Error("Unknown room type " + inType);
    }
  }

  Room.prototype = {
    getExitForEntrance: function( inDir ) {
      for (var i=0; i < this.paths.length; i++) {
        var path = this.paths[i];
        if (path[0] === inDir) {
          return path[1];
        }
      }
      return undefined;  // no exit from this room when entering from inDir
    }
  };

  return Room;
})();


// transform room array to more understandable cartesian way
function getRoom( x, y ) {
  return rooms[y][x];
}


//----------------------------------------------------------------------
// init
//----------------------------------------------------------------------
var rooms = [];  // array of layers of rooms

var inputs = readline().split(' ');
var W = parseInt(inputs[0]); // number of columns.
var H = parseInt(inputs[1]); // number of rows.

for (var i = 0; i < H; i++) {
  // represents a line in the grid and contains W integers. Each
  // integer represents one room of a given type.
  var roomTypeList = readline().split(" ").map( function(i){ return i|0; });

  var roomRow = [];
  for (var r = 0; r < roomTypeList.length; r++) {
    roomRow.push( new Room( roomTypeList[r] ));
  }
  rooms.push( roomRow );
}

// the coordinate along the X axis of the exit (not useful for this
// first mission, but must be read).
var exitX = parseInt(readline());


for (var w=0; w < W; w++) {
  var str = "";
  for (var h=0; h < H; h++ ) {
    str += getRoom( w, h ).type + " ";
  }
  printErr( str );
}

//----------------------------------------
// game loop
//----------------------------------------
var layer = 0;
var x, y;

while (true) {
  inputs = readline().split(' ');
  var x0 = parseInt(inputs[0]);
  var y0 = parseInt(inputs[1]);
  var enteringFrom = inputs[2];

  if (!x && !y) {
    x = x0;
    y = y0;
  }

  var room = getRoom( x, y );

  printErr("In (" + x0 + "," + y0 + ") which is a square of type " + room.type );

  var exitDir = room.getExitForEntrance( enteringFrom );

  printErr("in: " + enteringFrom + " out: " + exitDir );

  if (exitDir === LEFT) {
    x--;
  } else if (exitDir === RIGHT) {
    x++;
  } else if (exitDir === BOTTOM) {
    y++;
  }

  print(x + " " + y); // One line containing the X Y coordinates of the room in which you believe Indy will be on the next turn.
}
