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
 *  2023: Try and hug left wall if it's smart, this leads to loops when stuck on islands
 *
 *      : Search out untracked areas, find nearest powder
 *  1378: collect known untaken exits and seek them out.  This makes no sense. We seem to get
 *        caught by ghosts more often doing this, even though we are covering more ground.
 **/

function debug( str ) {
  printErr( str );
}

var Actions = {
  right: {
    cmd: 'A',
    sprite: "<",
    valid: true
  },
  wait: {
    cmd: 'B',
    sprite: "o",
    valid: true
  },
  up: {
    cmd: 'C',
    sprite: "v",
    valid: true
  },
  down: {
    cmd: 'D',
    sprite: "^",
    valid: true
  },
  left: {
    cmd: 'E',
    sprite: ">",
    valid: true
  }
};


var Maze = (function()
{
  function Maze(width, height) {
    this.width = width;
    this.height = height;
    this.init();
    this.powder = [];
  }

  Maze.prototype = {

    /**
     * set up maze with emptiness
     */
    init: function() {
      this.field = [];

      for (var x = 0; x < this.width; x++) {
        this.field[x] = [];
        for (var y = 0; y < this.height; y++) {
          this.field[x][y] = {
            display: ".",
            wall: false,
            visited: false
          };
        }
      }
    },

    setMonster: function( x, y ) {
      this.field[x][y].isMonster = true;
      this.field[x][y].display = "@";
    },

    setPacman: function( x, y, action ) {
      this.field[x][y].isPacman = true;
      this.field[x][y].visited = true;
      this.field[x][y].display = action.sprite;

      this.field[x][y].isPowder = false;
      for (var i=0; i < this.powder.length; i++) {
        if (this.powder[i] && (this.powder[i].x === x) && (this.powder[i].y === y)) {
          this.powder[i] = undefined;
        }
      }
    },


    /**
     * update maze with known information
     */
    update: function() {
//      this.powder = [];  // clear list of known powder since we are iterating over whole map

      var field = this.field;

      for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
          field[x][y].display = " ";
          field[x][y].isMonster = false;
          field[x][y].isPacman = false;

          if (field[x][y].isPowder) {
            // this.powder.push( { x:x, y:y } );   // create list of fruitful places to head for
            field[x][y].display = "P";
          }

          if (field[x][y].isWall) {
            field[x][y].display = "|";
          }

          if (field[x][y].visited) {
            field[x][y].display = ".";
          }
        }
      }
    },

    /**
     * Handle wrapping around edges of maze
     */
    getWrappedCoords: function( x, y ) {
      if (x < 0) {
        x += this.width;
      }
      if (y < 0) {
        y += this.height;
      }
      if (x > this.width-1) {
        x -= this.width;
      }
      if (y > this.height-1) {
        y -= this.height;
      }

      return {x:x, y:y};
    },

    /**
     * See if the field has a monster at this location
     */
    isMonster: function( x, y ) {
      var pos = this.getWrappedCoords( x, y );
      return this.field[pos.x][pos.y].isMonster;
    },

    isWall: function( x, y ) {
      var pos = this.getWrappedCoords( x, y );
      return this.field[pos.x][pos.y].isWall;
    },

    wasVisited: function( x, y ) {
      var pos = this.getWrappedCoords( x, y );
      return this.field[pos.x][pos.y].visited;
    },

    /**
     * analyze square to see if we should go there
     * also see if we should remember any of these square for later
     */
    updateSquare: function( x, y, action ) {

      var pos = this.getWrappedCoords( x, y );
      x = pos.x;
      y = pos.y;

      this.field[x][y].isWall = !action.valid;
      this.field[x][y].isPowder = action.valid && !this.field[x][y].visited;

      if (this.field[x][y].isPowder) {
        this.powder.push({ x:x, y:y });
      }

      action.smart = this.field[x][y].isPowder;
    },

    /**
     * Pathfind to all known fresh powder,
     * @return route to nearest powder
     */
    findClosestFreshPowder: function( pacman ) {
      var i, paths = [];

      // debug("There are " + this.powder.length + " places we might go");

      for (i=this.powder.length-1; i > 0; i--) {
        var powderSquare = this.powder[i];
        if (!powderSquare) {
          continue;  // we carved this already
        }

        debug("Heading to " + JSON.stringify( powderSquare ));
        var pathToPowder = getShortestPath( pacman, powderSquare, [], pacman, null );
        if (pathToPowder) {
          paths.push( pathToPowder );
          debug("Found path " + JSON.stringify( pathToPowder ));
          return pathToPowder;   // stop looking if we found any good path
        }
      }
      // delete this, too slow to search everywhere
      // var bestPath;
      // for (i=0; i < paths.length; i++) {
      //   if (!bestPath || (paths[i] && paths[i].length < bestPath.length)) {
      //     bestPath = paths[i];
      //   }
      // }
      // return bestPath;

      return [Actions.wait];  // cant find a good path
    },


    print: function() {
      debug("=== MAZE ===");
      for (var y = 0; y < this.height; y++) {
        var line = "";
        for (var x = 0; x < this.width; x++) {
          line += this.field[x][y].display;
        }
        printErr( line );
      }
      debug("==========");
    }


  };

  return Maze;
})();


/**
 * ensure we don't run into a ghost, at least not when we don't need to
 */
function checkForMonsters( pacman, maze ) {

  var x = pacman.x;
  var y = pacman.y;

  // check for imminent danger in all directions (plus one)
  if (Actions.right.valid &&
      maze.isMonster( x+2, y ) ||
      maze.isMonster( x+1, y ) ||
      maze.isMonster( x+1, y-1 ) ||
      maze.isMonster( x+1, y-1 ))
  {
    Actions.right.valid = false;
  }

  if (Actions.left.valid &&
      maze.isMonster( x-2, y ) ||
      maze.isMonster( x-1, y ) ||
      maze.isMonster( x-1, y-1 ) ||
      maze.isMonster( x-1, y+1 ))
  {
    Actions.left.valid = false;
  }

  if (Actions.up.valid &&
      maze.isMonster( x, y-2 ) ||
      maze.isMonster( x, y-1 ) ||
      maze.isMonster( x-1, y-1 ) ||
      maze.isMonster( x+1, y-1 ))
  {
    Actions.up.valid = false;
  }

  if (Actions.down.valid &&
      maze.isMonster( x, y+2 ) ||
      maze.isMonster( x, y+1 ) ||
      maze.isMonster( x-1, y+1 ) ||
      maze.isMonster( x+1, y+1 ))
  {
    Actions.down.valid = false;
  }
}

/**
 * @param actions prioritized list of potential actions,
 * @return the first action that is not a wall or a monster
 */
function getFirstValidAction( actions ) {
  var i;

  for (i=0; i < actions.length; i++) {
    if (actions[i].valid && actions[i].smart) {
      return actions[i];
    }
  }
  for (i=0; i < actions.length; i++) {
    if (actions[i].valid) {
      return actions[i];
    }
  }
  return Actions.wait;
}

/**
 * @param actions prioritized list of potential actions,
 * @return the first action that is fresh powder
 */
function getFirstFreshAction( actions ) {
  var i;

  for (i=0; i < actions.length; i++) {
    if (actions[i].valid && actions[i].smart) {
      return actions[i];
    }
  }
  return Actions.wait;
}


/**
 * @return the action that keeps us hugging the left wall given our current path of travel
 */
function getHugLeftWallAction( field, currentAction ) {

  if (currentAction === Actions.up) {
    return getFirstFreshAction( [Actions.left, Actions.up, Actions.right, Actions.down] );
  }

  if (currentAction === Actions.down) {
    return getFirstFreshAction( [Actions.right, Actions.down, Actions.left, Actions.up ] );
  }

  if (currentAction === Actions.left) {
    return getFirstFreshAction( [Actions.down, Actions.left, Actions.up, Actions.right] );
  }

  if (currentAction === Actions.right) {
    return getFirstFreshAction( [Actions.up, Actions.right, Actions.down, Actions.left] );
  }

  return Actions.wait;
}





//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

/**
 * Recursive funcion to find shortest path from src to dest
 * @param path current list of actions to get here
 * @param origin where we started (to avoid loops)
 * @param lastAction so we don't double back on ourselves
 */
function getShortestPath( src, dest, path, origin, lastAction ) {
  // see where action takes us.  If it's valid, keep going, if not return null

  // avoid over thinking
  if (path.length > 15) {
    return null;
  }

  src = maze.getWrappedCoords( src.x, src.y );

  debug("Checking " + JSON.stringify( src ) + " for dest " + JSON.stringify( dest ));

  if (lastAction) {  // make sure we've moved one square before ending recursion

    if ((src.x === dest.x) && (src.y === dest.y) && !maze.isMonster( src.x, src.y )) {
      debug("Found a path to " + JSON.stringify( dest ));
      return path;  // we've arrived, end recursion
    }

    // check if path is invalid (hit a bad square or looped back)
    if (!maze.wasVisited( src.x, src.y ) ||
        maze.isWall( src.x, src.y ) ||
        maze.isMonster( src.x, src.y ) ||
        ((src.x === origin.x) && (src.y === origin.y)))
    {
      debug("obstacle found at " + JSON.stringify( src ));
      return null;
    }
  }

  var paths = [];
  var newSrc, newPath;

  if (lastAction !== Actions.right) {   // don't double back
    newSrc = { x: src.x-1, y: src.y };
    newPath = path.slice(0);  // copy array
    newPath.push( Actions.left );
    paths.push( getShortestPath( newSrc, dest, newPath, origin, Actions.left ));
  }

  if (lastAction !== Actions.left) {
    newSrc = { x: src.x+1, y: src.y };
    newPath = path.slice(0);
    newPath.push( Actions.right );
    paths.push( getShortestPath( newSrc, dest, newPath, origin, Actions.right ));
  }

  if (lastAction !== Actions.down) {
    newSrc = { x: src.x, y: src.y-1 };
    newPath = path.slice(0);
    newPath.push( Actions.up );
    paths.push( getShortestPath( newSrc, dest, newPath, origin, Actions.up ));
  }

  if (lastAction !== Actions.up) {
    newSrc = { x: src.x, y: src.y+1 };
    newPath = path.slice(0);
    newPath.push( Actions.down );
    paths.push( getShortestPath( newSrc, dest, newPath, origin, Actions.down ));
  }

  var bestPath;
  for (var i=0; i < paths.length; i++) {

    if (paths[i]) {
      // debug("Path: " +paths[i].length);
    }
    if (!bestPath || (paths[i] && paths[i].length < bestPath.length)) {
      bestPath = paths[i];
    }
  }
  return bestPath;
}





//----------------------------------------------------------------------
//  Main
//----------------------------------------------------------------------

var h = parseInt(readline());
var w = parseInt(readline());
var numThings = parseInt(readline());

var maze = new Maze( w, h );
var pacman = {};

debug( numThings + " on " + w + "x" + h);

var action = Actions.left;
var currentPath;   // plotted path to fresh powder
var wandering = 0;

// game loop
while (true) {

  maze.update();  // update for drawing purposes

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
    maze.setMonster( x, y );

    // it's us!
    if (i+1 === numThings) {
      maze.setPacman( x, y, action );
      pacman.x = x;
      pacman.y = y;
    }
  }

  // Now see where we can go and where is unexplored.

  Actions.up.valid = ("_" === a);
  Actions.right.valid = ("_" === b);
  Actions.down.valid = ("_" === c);
  Actions.left.valid = ("_" === d);

  var x = pacman.x;
  var y = pacman.y;

  // See which adjacent squares are passable and which are not yet visited
  maze.updateSquare( x, y-1, Actions.up );
  maze.updateSquare( x, y+1, Actions.down );
  maze.updateSquare( x-1, y, Actions.left );
  maze.updateSquare( x+1, y, Actions.right );

  checkForMonsters( pacman, maze );  // don't run into anyone

  maze.print();

  // take unexplored ways first, continue old path if safe
  // only looks at square ahead of us, does not plan a route out to unexplored space
  // TBD: collect known untaken exits and seek them out.

  // 1. if fresh powder anywhere, take it in hug-left fashion
  // 2. goal seek to all known fresh powder and plot shortest route.


/*
  action = getHugLeftWallAction( maze.field, action );

  if (action !== Actions.wait) {    // we found powder! Take it
    currentPath = null;

  } else {                          // go hunting for powder
    if (!currentPath) {
      currentPath = maze.findClosestFreshPowder( pacman );
    }
    debug("Executing " + currentPath.length + " commands to find powder");

    action = currentPath.shift();   // get next action on route to fresh powder

    if (!action.valid) {  // probably a monster snuck up on us. Run! Anywhere!
      // this is not necessarily right, need to know where this path was going.  FIXME
      maze.powder.pop();  // invalidate last place we were headed.
      action = getFirstValidAction( [Actions.right, Actions.down, Actions.left, Actions.up ] );
    }

    if (!currentPath.length) {
      currentPath = null;
    }
  }
*/


  // this doesn't seem to help.  No clue at this point other than more intelligence with ghosts?
  if (wandering > 15) {

    if (!currentPath) {
      currentPath = maze.findClosestFreshPowder( pacman );
    }
    debug("Executing " + currentPath.length + " commands to find powder");

    action = currentPath.shift();   // get next action on route to fresh powder

    if (!action.valid) {  // probably a monster snuck up on us. Run! Anywhere!
      // this is not necessarily right, need to know where this path was going.  FIXME
      maze.powder.pop();  // invalidate last place we were headed.
      action = getFirstValidAction( [Actions.right, Actions.down, Actions.left, Actions.up ] );
    }

    if (!currentPath.length) {
      currentPath = null;
      wandering = 0;
    }

  } else {


    // dumbly wander, but at least choose powder (smart) over already visited or bad places

    if (action.valid && action.smart) {
      // continue old path
      wandering = 0;
    } else if (Actions.left.valid && Actions.left.smart) {
      action = Actions.left;
      wandering = 0;
    } else if (Actions.down.valid && Actions.down.smart) {
      action = Actions.down;
      wandering = 0;
    } else if (Actions.right.valid && Actions.right.smart) {
      action = Actions.right;
      wandering = 0;
    } else if (Actions.up.valid && Actions.up.smart) {
      action = Actions.up;
      wandering = 0;

    } else if (action.valid) {
      // continue old path even though we've been here before
      wandering++;
    } else if (Actions.right.valid) {
      action = Actions.right;
      wandering++;
    } else if (Actions.up.valid) {
      action = Actions.up;
      wandering++;
    } else if (Actions.left.valid) {
      action = Actions.left;
      wandering++;
    } else if (Actions.down.valid) {
      action = Actions.down;
      wandering++;
    } else {
      action = Actions.wait;
      wandering++;
    }
  }

  print( action.cmd );
}
