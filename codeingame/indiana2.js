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

// rotate a door on a room clockwise (right) or counterclockwise (left)
function rotate( door, direction ) {
  if (door === LEFT) {
    return (direction === LEFT)? BOTTOM:TOP;
  }
  if (door === RIGHT) {
    return (direction === LEFT)? TOP:BOTTOM;
  }
  if (door === TOP) {
    return (direction === LEFT)? LEFT:RIGHT;
  }
  if (door === BOTTOM) {
    return (direction === LEFT)? RIGHT:LEFT;
  }
  throw new Error("Unknown room position: " + door);
}


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

    if (inType < 0) {
      this.notRotatable = true;
      this.type = -inType;
    }
  }

  Room.prototype = {
    rotate: function( inRotation ) {

      if (this.notRotatable) {
        return;
      }

      switch (this.type) {
        case  0: break;
        case  1: break;
        case  2: this.type = 3; break;
        case  3: this.type = 2; break;
        case  4: this.type = 4; break;
        case  5: this.type = 5; break;
        case  6: this.type = (inRotation===LEFT)? 9:7; break;
        case  7: this.type = (inRotation===LEFT)? 6:8; break;
        case  8: this.type = (inRotation===LEFT)? 7:9; break;
        case  9: this.type = (inRotation===LEFT)? 8:6; break;
        case 10: this.type = (inRotation===LEFT)? 13:11; break;
        case 11: this.type = (inRotation===LEFT)? 10:12; break;
        case 12: this.type = (inRotation===LEFT)? 11:13; break;
        case 13: this.type = (inRotation===LEFT)? 12:10; break;
        default: throw new Error("Unknown room type " + this.type);
      }
    },

    getPaths: function() {
      switch (this.type) {
        case  0: return [];
        case  1: return [[TOP,BOTTOM], [LEFT,BOTTOM], [RIGHT,BOTTOM]];
        case  2: return [[LEFT,RIGHT], [RIGHT,LEFT]];
        case  3: return [[TOP,BOTTOM]];
        case  4: return [[TOP,LEFT],   [RIGHT,BOTTOM]];
        case  5: return [[TOP,RIGHT],  [LEFT,BOTTOM]];
        case  6: return [[LEFT,RIGHT], [RIGHT,LEFT]];
        case  7: return [[TOP,BOTTOM], [RIGHT,BOTTOM]];
        case  8: return [[LEFT,BOTTOM],[RIGHT,BOTTOM]];
        case  9: return [[TOP,BOTTOM], [LEFT,BOTTOM]];
        case 10: return [[TOP,LEFT]];
        case 11: return [[TOP,RIGHT]];
        case 12: return [[RIGHT,BOTTOM]];
        case 13: return [[LEFT,BOTTOM]];
        default: throw new Error("Unknown room type " + this.type);
      }
    },


    getExitForEntrance: function( inDir ) {
      var paths = this.getPaths();

      for (var i=0; i < paths.length; i++) {
        var path = paths[i];
        if (path[0] === inDir) {
          return path[1];
        }
      }
      return undefined;  // no exit from this room when entering from inDir
    },
    hasEntranceFrom: function( inFromDir ) {
      var dir;
      if (inFromDir == "LEFT") {
        dir = "RIGHT";
      } else if (inFromDir == "RIGHT") {
        dir = "LEFT";
      } else if (inFromDir == "BOTTOM") {
        dir = "TOP";
      }
      return !!this.getExitForEntrance( dir );
    }

  };

  return Room;
})();


// transform room array to more understandable cartesian way
function getRoom( x, y ) {
  return rooms[y][x];
}

function printRooms() {
  for (var y=0; y < H; y++) {
    var str = "";
    for (var x=0; x < W; x++ ) {
      str += getRoom( x, y ).type + " ";
    }
    printErr( str );
  }
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

  var numRocks = parseInt(readline());
  for (i = 0; i < numRocks; i++) {
    inputs = readline().split(' ');
    var xR = parseInt(inputs[0]);
    var yR = parseInt(inputs[1]);
    var enteringFromRock = inputs[2];
  }

  if (!x && !y) {
    x = x0;
    y = y0;
  }

  printRooms();

  var room = getRoom( x, y );

  printErr("In (" + x0 + "," + y0 + ") which is a square of type " +
           room.type + ": " + room.getPaths() );

  var exitDir = room.getExitForEntrance( enteringFrom );

  printErr("in: " + enteringFrom + " out: " + exitDir );

  if (exitDir === LEFT) {
    x--;
  } else if (exitDir === RIGHT) {
    x++;
  } else if (exitDir === BOTTOM) {
    y++;
  }

  // if nextRoom has an entrance then "WAIT" and let the app fall for us
  // otherwise rotate the next room to fit us.

  // damn, we have to look all the way forward and recurse back if the path fails

  var newRoom = getRoom( x, y );

  if (newRoom.hasEntranceFrom( exitDir )) {
    print("WAIT");
  } else {
    // rotate such that new exit is not UP
    newRoom.rotate( LEFT );
    var newEntranceDir = rotate( rotate( exitDir, LEFT ), LEFT);

    var nextExit = newRoom.getExitForEntrance( newEntranceDir );
    if (!nextExit || nextExit === TOP) {
      newRoom.rotate( LEFT );
      newRoom.rotate( LEFT );  // three lefts make a right
      print(x + " " + y + " " + RIGHT);
    } else {
      print(x + " " + y + " " + LEFT);
    }

  }
}
