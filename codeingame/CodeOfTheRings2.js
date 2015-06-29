/**
 * CodeOfTheRings challenge on codingame.com
 * 
 * 2015, dwhitnee@gmail.com
 **/

String.prototype.repeat = function(n){
    return Array(n+1).join(this);
};

function debug( str ) {
  printErr( str );
}

// The commands to move the hobbit around and to change letters on each rune.
var MOVE = {
    "RIGHT": ">",
    "LEFT" : "<"
};
var LETTER = {
    "UP"  : "+",
    "DOWN": "-"
};
var ENTER = ".";


//----------------------------------------------------------------------
// Object that contains all Runes and the algorithms to determine the best rune to update
// given a _single_ letter to change.
// I suppose I could take multiple letter changes into account, but meh.
//----------------------------------------------------------------------
var Runes = (function() 
{
  function Runes( num ) {
    this.currentRune = 0;
    this.letters = Array( num ).join(" ").split("");   // inital letters on runes;
  }
  
  Runes.prototype = {

    // should we move to another rune that is faster to update than the current one?
    changeToBestRune: function( newLetter ) {
      // iterate over runes to find best one to update
      var bestDistance = 100000;
      var bestRune = -1;
      
      for (var i=0; i < this.letters.length; i++) {
        // how far away is rune[i] and how many letters need to shift?
        var letterOnRune = this.letters[i];
        var info = this.getDistanceAndDirToLetter( newLetter, letterOnRune );
        var letterDistance = info.dist;
        var runeDistance = Math.abs( this.currentRune - i );
        
        // debug( letterDistance );
        
        if ((letterDistance + runeDistance) < bestDistance) {
          bestDistance = letterDistance + runeDistance;
          bestRune = i;
        }
      }

      // debug("Best Rune is " + bestRune );

      var info = this.getCommandToMoveToRune( bestRune );

      this.currentRune = bestRune;

      return info.dir.repeat( info.dist );
    },

    // either move right or left, whichever is better of these 30 runes
    // RIGHT: dest > src and dist < 15
    // LEFT:  dest > src and dist >= 15
    // LEFT:  dest < src and dist < 15
    // RIGHT: dest < src and dist < 15
    getCommandToMoveToRune: function( destRune ) {
      var dir = MOVE.RIGHT;
      var dist = Math.abs( this.currentRune - destRune );

      if (dist < 15) {
        if (destRune < this.currentRune) {
          dir = MOVE.LEFT;
        }
      } else {
        dist = 30 - dist;
        if (destRune > this.currentRune) {
          dir = MOVE.LEFT;
        }
      }
      
      return {
        dist: dist,
        dir: dir
      };
    },

    /**
     * @return [dist, dir] between these two letters
     * four cases
     * RIGHT: new is greater then current and distance is <= 13 
     * LEFT:  new is greater then current and distance is > 13
     * LEFT:  new is less then current and distance is <= 13
     * RIGHT: new is less then current and distance is > 13
     */
    getDistanceAndDirToLetter: function( newLetter, currentLetter ) {
      var src = 0, dest = 0;
      
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
      
      // debug("From '" + currentLetter + "' to '" + newLetter +
      //          "' move " + dir + dist + " times");

      return {
        dir: dir,
        dist: dist 
      };
    },
    
    printRunes: function() {
      return this.letters.join("|");
    },

    changeLetterOnCurrentRune: function( newLetter ) {
      
      var info = this.getDistanceAndDirToLetter( newLetter, this.letters[this.currentRune] );
      
      // debug("Changing rune " + this.currentRune + 
      //       " from '" + this.letters[this.currentRune] +
      //       "' to '" + newLetter + "'" );


      // udpate rune state
      this.letters[this.currentRune] = newLetter;

      printErr( this.printRunes() );
      
      return info.dir.repeat( info.dist ) + ENTER;
    }
  };

  return Runes;
})();

//----------------------------------------
// increment one rune up or down the optimal number of times
// Should also check if moving right and changing a blank rune is better.
//----------------------------------------
function spell( runes, newLetter ) {
  var cmd = runes.changeToBestRune( newLetter );
  cmd += runes.changeLetterOnCurrentRune( newLetter );

  return cmd;
}


//----------------------------------------------------------------------
var magicPhrase = "THREE RINGS FOR THE ELVEN KINGS UNDER THE SKY SEVEN FOR THE DWARF LORDS IN THEIR HALLS OF STONE NINE FOR MORTAL MEN DOOMED TO DIE ONE FOR THE DARK LORD ON HIS DARK THRONEIN THE LAND OF MORDOR WHERE THE SHADOWS LIE";
// 865

debug( magicPhrase );

var runes = new Runes( 30 );

var cmd = spell( runes, magicPhrase[0], " ");
for (var i = 1; i < magicPhrase.length; i++) {
  cmd += spell( runes, magicPhrase[i], magicPhrase[i-1] );
}

printErr("Length of instructions: " + cmd.length );
print( cmd );


function print(msg) {
  console.log( msg );

  if (
    (msg !== '+.>-.') &&
    (msg !== '+.--.'))
  {
    console.error("NOPE");
  } else {
    console.error("YEP!");
  }
}

function printErr(msg) {
  console.log( msg );
}
