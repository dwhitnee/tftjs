/**
 * This seems to be PacMan
 * 2016, David Whitney
 **/

function debug( str ) {
  printErr( str );
}

var height = parseInt(readline());
var width = parseInt(readline());
var numThings = parseInt(readline());

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

function initField( field ) {
  for (var x = 0; x < width; x++) {
    field[x] = [];
    for (var y = 0; y < height; y++) {
      field[x][y] = ".";
    }
  }
}

function clearField( field ) {
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      if (field[x][y] === "O") {
        field[x][y] = ".";
      }
    }
  }
}

function printField( field ) {
  debug("===Field===");
  for (var y = 0; y < height; y++) {
    var line = "";
    for (var x = 0; x < width; x++) {
      line += field[x][y];
    }
    debug( line );
  }
}


initField( field );

// game loop
while (true) {
  clearField( field );

  Actions.up.valid = ("_" === readline());
  Actions.right.valid = ("_" === readline());
  Actions.down.valid = ("_" === readline());
  Actions.left.valid = ("_" === readline());

  for (var i = 0; i < numThings; i++) {
    var inputs = readline().split(' ');
    debug( inputs );
    var x = parseInt(inputs[0]);
    var y = parseInt(inputs[1]);
    field[x][y] = "O";
  }

  if (!Actions.up.valid) {
    field[x][y-1] = "-";
  }
  if (!Actions.down.valid) {
    field[x][y+1] = "-";
  }

  if (!Actions.left.valid) {
    field[x-1][y] = "|";
  }
  if (!Actions.right.valid) {
    field[x-1][y] = "|";
  }

  printField( field );

  if ( Actions[action].valid ) {
  // keep going if possible
  } else if (Actions.left.valid) {
    action = "left";
  } else if (Actions.down.valid) {
    action = "down";
  } else if (Actions.right.valid) {
    action = "right";
  } else if (Actions.up.valid) {
    action = "up";
  } else {
    action = "wait";
  }

  debug("Moving " + action );
  print( Actions[action].cmd );
}