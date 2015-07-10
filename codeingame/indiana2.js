/**
 * Indiana challenge on codingame.com
 *
 * 2015, dwhitnee@gmail.com
 */
/*global print, printErr, readline */

/**
 *  Array.includes polyfill
 */
if (![].last) {
  Array.prototype.last = function() {
    return this[this.length-1];
  };
}

if (![].includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
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
//----------------------------------------------------------------------


// absolute positions on a room
var TOP = "TOP";
var BOTTOM = "BOTTOM";
var LEFT = "LEFT";
var RIGHT = "RIGHT";
var BACK_UP = "DAMMIT";


var doLog = true;
function log( s ) {
  if (doLog) {
    printErr( s );
  }
}

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
  function Room( x, y, inType ) {
    this.type = inType;
    this.paths = [];
    this.x = x;
    this.y = y;

    if (inType < 0) {
      this.notRotatable = true;
      this.type = -inType;
    }
  }

  Room.prototype = {
    isDecisionPoint: function() {
      return (this.type === 4) || (this.type === 5) ||
        (this.type === 10) || (this.type === 11) || 
        ((this.type >= 6) && (this.type <= 9));
      // 6-9 are decisions between 6 and the others
    },

    // cache indy's state when in this room for later recovery if we
    // change our mind about the next room
    setIndy: function( indy ) {
      this.indy = JSON.parse( JSON.stringify( indy ));
    },
    getIndy: function() {
      return JSON.parse( JSON.stringify( this.indy ));
    },

    unrotate: function() {
      this.type = this.oldType || this.type;
      this.oldType = undefined;
    },

    rotate: function( inRotation ) {

      if (this.notRotatable) {
        return;
      }

      this.oldType = this.oldType || this.type;

      switch (this.type) {
        case  0: break;
        case  1: break;
        case  2: this.type = 3; break;
        case  3: this.type = 2; break;
        case  4: this.type = 5; break;
        case  5: this.type = 4; break;
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
function getRoom( indy ) {
  return rooms[indy.y][indy.x];
}
function pad(n) {
  return n > 9 ? "" + n: "0" + n;
}
function printRooms() {
  for (var y=0; y < H; y++) {
    var str = "";
    for (var x=0; x < W; x++ ) {
      str += pad( getRoom( { x:x, y:y} ).type ) + " ";
    }
    // log( str );
  }
}


function invalidExit( exit, x ) {
  var invalid = !exit;

  if (!invalid) {
    invalid = ((exit == TOP) || 
               ((exit == RIGHT) && (x+1 === W)) ||
               ((exit == LEFT) && (x === 0)));
  }
  return invalid;
}

// if type 4/5 or 10/11, that represents a choosing point

// @param tryOtherWay if true then always rotate RIGHT
function moveThroughMaze( indy, tryOtherWay ) {
  var command, doDouble;

  var room = getRoom( indy );
  room.setIndy( indy );

  var exitDir = room.getExitForEntrance( indy.enteringFrom );

  printRooms();
  log("in: " + indy.enteringFrom + " out: " + exitDir );

  if ((exitDir === BOTTOM) && (indy.y  === rooms.length-1)) {
    return undefined;  // done!
  }

  if (!exitDir) {
    // fail!  back up to last decision point and try other path
    return BACK_UP;
  }

  if (exitDir === LEFT) {
    indy.x--;
  } else if (exitDir === RIGHT) {
    indy.x++;
  } else if (exitDir === BOTTOM) {
    indy.y++;
  }

  var newRoom = getRoom( indy );

  var newEntranceDir = rotate( rotate( exitDir, LEFT ), LEFT);

  if (tryOtherWay) {
    if (newRoom.type == 7) {     // rotate left
      newRoom.rotate( LEFT );
      command = indy.x + " " + indy.y + " " + LEFT;

    } else if (newRoom.type == 9) {  // rotate right
      newRoom.rotate( RIGHT );
      command = indy.x + " " + indy.y + " " + RIGHT;

    } else if (newRoom.type == 8) {  // double rotate LEFT to 6
      newRoom.rotate( RIGHT );
      newRoom.rotate( RIGHT );
      command = indy.x + " " + indy.y + " " + RIGHT;
      doDouble = true;

    } else {
      newRoom.unrotate();
      newRoom.rotate( RIGHT );
      command = indy.x + " " + indy.y + " " + RIGHT;
    }

  } else if (newRoom.hasEntranceFrom( exitDir )) {
    command = "WAIT";
    
  } else {
    // rotate such that new exit is not UP and entrance is avaliable
    newRoom.rotate( LEFT );  // try left first

    var nextExit = newRoom.getExitForEntrance( newEntranceDir );

    if (invalidExit( nextExit, indy.x )) {   // Then try right
      newRoom.rotate( RIGHT );  // undo the left first
      newRoom.rotate( RIGHT );

      nextExit = newRoom.getExitForEntrance( newEntranceDir );
      if (invalidExit( nextExit, indy.x )) {  // try reverse
        // rotate right once more, but this is a double action (reverse really)
        newRoom.rotate( RIGHT );
        doDouble = true;
      }
      command = indy.x + " " + indy.y + " " + RIGHT;
    } else {
      command = indy.x + " " + indy.y + " " + LEFT;
    }
  }

  indy.enteringFrom =  newEntranceDir;

  log("----");
  log( command );
  log( JSON.stringify( indy ));
  log("----");

  return {
    command: command,
    room: room,
    nextRoom: newRoom,
    doDouble: doDouble,  // if this is true, we need to do another RIGHT
    isChangable: (newRoom.isDecisionPoint() && !tryOtherWay)
  };
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
    roomRow.push( new Room( r, i, roomTypeList[r] ));
  }
  rooms.push( roomRow );
}

// the coordinate along the X axis of the exit (not useful for this
// first mission, but must be read).
var exitX = parseInt(readline());
log("EXIT: " + exitX );

//----------------------------------------
// game loop
//----------------------------------------
var layer = 0;


// initial pos
inputs = readline().split(' ');
var x = parseInt(inputs[0]);
var y = parseInt(inputs[1]);
var enteringFrom = inputs[2];

var indy = {
  x: x,
  y: y,
  enteringFrom: enteringFrom
};


try {
  var done = false;
  var actions = [];
  var tryOtherWay = false;

  while (!done) {
    var action = moveThroughMaze( indy, tryOtherWay );
    
    if ((action === BACK_UP) || (!action && indy.x != exitX)) {
      // rewind until last decision point we can change
      if (!action) {
        log(indy.x + " is not the exit column :" + exitX );
      }

      var oldAction;
      while (!actions.last().isChangable) {
        actions.pop().nextRoom.unrotate();
        log("Backing up!");
      }
      oldAction = actions.pop();
      indy = oldAction.room.getIndy();

      log("Backed up to " + JSON.stringify( indy ));
      tryOtherWay = true;
      
    } else if (!action) {
      done = true;

    } else {
      if (action.doDouble) {
        // go back and change a "WAIT" to a "RIGHT"
        for (var w=actions.length-1; w > 0; w--) {
          if (actions[w].command == "WAIT") {
            actions[w].command = action.command;
            break;
          }
        }
      }
      actions.push( action );
      tryOtherWay = false;
    }
  }

  log("Done!");

  while (true) {
    var action = actions.shift();
    print( action.command );
    printErr("Because " + JSON.stringify( action.room ));

    // inputs = readline().split(' ');
    // var x0 = parseInt(inputs[0]);
    // var y0 = parseInt(inputs[1]);
    // var enteringFrom = inputs[2];

    // var numRocks = parseInt(readline());
    // for (i = 0; i < numRocks; i++) {
    //   inputs = readline().split(' ');
    //   var xR = parseInt(inputs[0]);
    //   var yR = parseInt(inputs[1]);
    //   var rockEnteringFrom = inputs[2];
    // }
  }
}
catch (err) {
  printErr( err+ ": " + err.stack );
}
