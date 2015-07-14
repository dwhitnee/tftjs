/**
 * Lakes
 * Codeingame
 * 
 * 2015, David Whitney (dwhitnee)
 */
//----------------------------------------
var Map = (function() 
{
  function Map() {
    this.grid = {};
  }
  
  Map.prototype = {
    get: function( x, y ) {
      return this.grid[x+":"+y];
    },
    set: function( x, y, val ) {
      this.grid[x+":"+y] = val;
    }
  };

  return Map;
})();
//----------------------------------------

var NORTH = "NORTH";
var SOUTH = "SOUTH";
var EAST = "EAST";
var WEST = "WEST";

// Recursion works unless there is a very large lake, how to tail recurse?
// or just scan a lake.  Recurse to the top of the lake and then scan?
// are there bays?
function sizeOfLakeAt( x, y, id, from ) {

  // recursion wont work on large lakes, need to iterate
  // scan for long stretch of water first (where recursion wont work)
  // if we find it then go up/left to find upper corner, then scan?

  var punt = true;
  for (var i=0; i< 200; i++) {
    if (!map.get(x+i. y)) {
      punt = false;
      break;
    }
  }
  if (punt) {
    return 0;
  }

  var spot = map.get(x,y);

  printErr( x + ", " + y + ": " + map.get(x,y) + "  from " + from);
  if (!spot) {
    return 0;
  }

  if ((spot !== id) || (spot === -1)) {
    map.set( x, y, id);
  } else {
    return 0; // been here already, punt
  }

  var size = 0;

  if (from !== EAST) {
    size += sizeOfLakeAt( x+1, y, id, WEST );
  }
  if (from !== WEST) {
    size += sizeOfLakeAt( x-1, y, id, EAST );
  }
  if (from !== SOUTH) {
    size += sizeOfLakeAt( x, y+1, id, NORTH );
  }
  if (from !== NORTH) {
    size += sizeOfLakeAt( x, y-1, id, SOUTH );
  }

  return 1 + size;
}

//----------------------------------------
// init
//----------------------------------------
var width = parseInt(readline());
var height = parseInt(readline());
var map = new Map();

for (var y = 0; y < height; y++) {
  var row = readline();
  for (var x = 0; x < row.length; x++) {
    if (row[x] === "O") {
      map.set( x, y, -1 );
    }
  }
}

var numPts = parseInt(readline());

for (var i = 0; i < numPts; i++) {
  var inputs = readline().split(' ');
  var x = parseInt(inputs[0]);
  var y = parseInt(inputs[1]);
  
  print( sizeOfLakeAt( x, y, i+1 ));
}


