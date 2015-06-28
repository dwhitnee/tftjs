/**
 * CodeOfTheRights
 * 
 * 2015, dwhitnee@gmail.com
 **/

String.prototype.repeat= function(n){
    return Array(n+1).join(this);
};

var runes = " ".repeat(30);  // current state of runes
var runeIndex = 0;

var MOVE = {
    "RIGHT": ">",
    "LEFT" : "<"
};
var LETTER = {
    "UP"  : "+",
    "DOWN": "-"
};
var ENTER = ".";

var Runes = {
  current: 0,
  letters: " ".repeat( 30 ),   // inital state of runes
  update: function( newLetter ) {
    this.letters[current] = newLetter;
  },
  // should we move to another rune that is better?
  getCmdToBestToUpdateTo: function( letter ) {
    // iterate over runes to find best one to update

  }
};

//----------------------------------------
// increment one rune up or down the optimal number of times
// Should also check if moving right and changing a blank rune is better.
//----------------------------------------
function spell( newLetter, currentLetter ) {
  var outCmd = "", src = 0, dest = 0;

  updatesRunes( newLetter );


}

/**
 * @return [dist, dir] between these two letters
 * four cases
 * RIGHT: new is greater then current and distance is <= 13 
 * LEFT:  new is greater then current and distance is > 13
 * LEFT:  new is less then current and distance is <= 13
 * RIGHT: new is less then current and distance is > 13
 */
function distanceBetweenLetters(  newLetter, currentLetter ) {
  if (newLetter !== " ") {
    dest = newLetter.charCodeAt() - 64;
  }
  if (currentLetter != " ") {
    src = currentLetter.charCodeAt() - 64;
  }

  var dist;
  var dir = LETTER.UP;

  if (newLetter > currentLetter ) {
    dist = dest - src;
    if (dist > 13) {
      dist = 27 - dist;
      dir = LETTER.DOWN;
    }
  } else {
    dist = src - dest;
    dir = LETTER.DOWN;
    if (dist > 13) {
      dist = 27 - dist;
      dir = LETTER.UP;
    }
  }

  printErr("From '" + currentLetter + "' to '" + newLetter + "' move " + dir + " " + dist + " spaces");
 
  return dir.repeat( dist ) + ENTER;
}

//----------------------------------------------------------------------
var magicPhrase = readline();

var cmd = spell( magicPhrase[0], " ");
for (var i = 1; i < magicPhrase.length; i++) {
  cmd += spell( magicPhrase[i], magicPhrase[i-1] );
}
printErr( cmd );
print( cmd );


// Write an action using print()
// To debug: printErr('Debug messages...');

// print( spell(magicPhrase, " " ));

// print( LETTER.UP + ENTER + LETTER.DOWN + LETTER.DOWN + ENTER);
// print('+.>-.');
