/**
 * This seems to be PacMan.
 * Initial inputs are size of grid and # of monsters
 * Loop inputs are valid moves and location of everyone.
 *
 * Move our guy around the maze and try to build up a valid picture of
 * the world while avoiding capture. Points seem to be allocated for
 * each new square we occupy.
 *
 * The maze wraps around on itself.
 *
 * 2016/01/15, David Whitney
 *
 *  1006 (62/622) Just avoid the noids
 *  1662 (37/622) Take new ways at forks
 *  1672 (37/622) properly check for wrap around cases
 *  2200: (28/627) reverse direction priorities when we've already been here.
 *
 *  TBD:  Search out untracked areas, how?
 **/

function debug( str ) {
  printErr( str );
}

var height = parseInt(readline());
var width = parseInt(readline());
var numThings = parseInt(readline());
var pacman = {};

debug( numThings + " on " + width + "x" + height);

var field = [];
var Actions = {
  right: {
    cmd: 'A',
    valid: true
  },
  wait: {
    cmd: 'B',
    valid: true
  },
  up: {
    cmd: 'C',
    valid: true
  },
  down: {
    cmd: 'D',
    valid: true
  },
  left: {
    cmd: 'E',
    valid: true
  }
};

var action = "left";

/**
 * set up maze with emptiness
 */
function initField( field ) {
  for (var x = 0; x < width; x++) {
    field[x] = [];
    for (var y = 0; y < height; y++) {
      field[x][y] = {
        display: ".",
        wall: false,
        visited: false
      };
    }
  }
}

/**
 * update maze with known information
 */
function clearField( field ) {
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      field[x][y].display = " ";
      field[x][y].isMonster = false;
      field[x][y].isPacman = false;

      if (field[x][y].isWall) {
        field[x][y].display = "#";
      }

      if (field[x][y].visited) {
        field[x][y].display = ".";
      }
    }
  }
}

function printField( field ) {
  debug("===Field===");
  for (var y = 0; y < height; y++) {
    var line = "";
    for (var x = 0; x < width; x++) {
      line += field[x][y].display;
    }
    debug( line );
  }
}

/**
 * See if the field has a monster at this location
 * Handles maze wrapping
 */
function isMonster( x, y ) {
  if (x<0) {
    x += width;
  }
  if (x > width-1) {
    x -= width;
  }
  if (y<0) {
    y += height;
  }
  if (y > height-1) {
    y -= height;
  }

  return field[x][y].isMonster;
}

/**
 * ensure we don't run into a ghost, at least not when we don't need to
 */
function checkForDanger( pacman, field ) {

  // check for imminent danger in all directions (plus one)
  if (Actions.right.valid &&
      isMonster( x+2, y ) ||
      isMonster( x+1, y ) ||
      isMonster( x+1, y-1 ) ||
      isMonster( x+1, y-1 ))
  {
    Actions.right.valid = false;
  }

  if (Actions.left.valid &&
      isMonster( x-2, y ) ||
      isMonster( x-1, y ) ||
      isMonster( x-1, y-1 ) ||
      isMonster( x-1, y+1 ))
  {
    Actions.left.valid = false;
  }

  if (Actions.up.valid &&
      isMonster( x, y-2 ) ||
      isMonster( x, y-1 ) ||
      isMonster( x-1, y-1 ) ||
      isMonster( x+1, y-1 ))
  {
    Actions.up.valid = false;
  }

  if (Actions.down.valid &&
      isMonster( x, y+2 ) ||
      isMonster( x, y+1 ) ||
      isMonster( x-1, y+1 ) ||
      isMonster( x+1, y+1 ))
  {
    Actions.down.valid = false;
  }

}



//----------------------------------------------------------------------
//----------------------------------------------------------------------

initField( field );

// game loop
while (true) {
  clearField( field );

  // figure out where walls are, inputs are _ or #
  var a = readline();
  var b = readline();
  var c = readline();
  var d = readline();

  debug("" + a+b+c+d);

  // figure out where monsters (and we) are
  for (var i = 0; i < numThings; i++) {
    var inputs = readline().split(' ');
    debug( inputs );
    var x = parseInt(inputs[0]);
    var y = parseInt(inputs[1]);
    field[x][y].isMonster = true;
    field[x][y].display = "@";

    // it's us!
    if (i+1 === numThings) {
      pacman.x = x;
      pacman.y = y;
      field[x][y].isPacman = true;
      field[x][y].visited = true;
      field[x][y].display = "<";
    }
  }

  // Now see where we can go and where is unexplored.

  Actions.up.valid = ("_" === a);
  Actions.right.valid = ("_" === b);
  Actions.down.valid = ("_" === c);
  Actions.left.valid = ("_" === d);

  var x = pacman.x;
  var y = pacman.y;

  // put up walls in invalid directions, and check for fresh powder
  if (y > 0) {
    field[x][y-1].isWall = !Actions.up.valid;
    Actions.up.smart =    Actions.up.valid && !field[x][y-1].visited;
  }
  if (y < height-1) {
    field[x][y+1].isWall = !Actions.down.valid;
    Actions.down.smart =  Actions.down.valid && !field[x][y+1].visited;
  }
  if (x > 0) {
    field[x-1][y].isWall = !Actions.left.valid;
    Actions.left.smart =  Actions.left.valid && !field[x-1][y].visited;
  }
  if (x < width-1) {
    field[x+1][y].isWall = !Actions.right.valid;
    Actions.right.smart = Actions.right.valid && !field[x+1][y].visited;
  }

  printField( field );

  checkForDanger( pacman, field );

  // take unexplored ways first, continue old path if safe

  if (Actions[action].valid && Actions[action].smart) {
    // continue old path
  } else if (Actions.left.valid && Actions.left.smart) {
    action = "left";
  } else if (Actions.down.valid && Actions.down.smart) {
    action = "down";
  } else if (Actions.right.valid && Actions.right.smart) {
    action = "right";
  } else if (Actions.up.valid && Actions.up.smart) {
    action = "up";
  } else if (Actions[action].valid) {
    // continue old path even though we've been here before
  } else if (Actions.right.valid) {
    action = "right";
  } else if (Actions.up.valid) {
    action = "up";
  } else if (Actions.left.valid) {
    action = "left";
  } else if (Actions.down.valid) {
    action = "down";
  } else {
    action = "wait";
  }

  debug("Moving " + action );
  print( Actions[action].cmd );
}