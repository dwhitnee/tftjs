Daleks.GameController = (function()
{
  function GameController( canvas ) {
    var self = this;
    this.board = new Daleks.Board( 30, 20 );
    canvas.append( this.board.getEl() );
    this.score = 0;
    this.level = 0;
  }

  GameController.prototype = {

    // create N daleks, and a player, add them to the board
    startNextLevel: function() {
      this.level++;
      this.gameOver = false;
      this.board.clear();

      $(".gameover").hide();

      this.enableKeyboardShortcuts();

      this.doctor = new Daleks.Piece("doctor");

      var handleMove = function( dir ) { 
        this.controls.moveDoctor( this.doctor, dir ); 
        this.updateWorld(); 
      };
      this.controls = new Daleks.DoctorControls( 
        this.board, 
        {
          fn: handleMove, 
          scope: this 
        });

      this.board.placeDoctor( this.doctor );

      this.rubble = [];
      this.daleks = [];
      for (var i = 0; i < 5 * this.level; i++) {
        this.daleks[i] = new Daleks.Piece("dalek");
        this.board.placeDalek( this.daleks[i] );
      }

      this.controls.update( this.doctor, this.board, this.daleks );

      $("#level").text( this.level );
    },

    // Update the css for all elements
    // TODO: animate motion
    draw: function() {
      for (var i in this.daleks) {
        this.daleks[i].draw();
      }
      for (i in this.rubble) {
        this.rubble[i].draw();
      }
      this.doctor.draw();
      this.controls.draw();

      $("#score").text( this.score );
    },

    // start event listeners, wait for input, then move and deal
    play: function() {
      this.gameOver = false;
      this.draw();
    },

    enableKeyboardShortcuts: function() {
      var self = this;
      $("body").on("keydown",
        function(e) { 
          switch (e.which) {
            case 76: self.lastStand(); break; 
            case 83: self.sonicScrewDriver();  break;
            case 84: self.teleport(); break;
          }
        });
    },
    disableKeyboardShortcuts: function() {
      $("body").off("keydown");
    },

    // the doctor made a move, respond
    updateWorld: function() {
      
      this.moveDaleks();  // TODO check doctor collision, too

      if (!this.gameOver) {
        // pass in things to block arrows: daleks, borders, rubble
        this.controls.update( this.doctor, this.board, 
                              this.daleks.concat( this.rubble ));
        this.draw();
      }
      
      // check for victory
      var victory = true;
      for (var i in this.daleks) {
        if (this.daleks[i]) {
          victory = false;
          break;
        }
      }
      
      if (victory) {
        this.win();
      }
    },

    //----------------------------------------
    moveDaleks: function() {
      for (var i in this.daleks) {// not a for loop beacuse this array is sparse
        var dalek = this.daleks[i];
        dalek.moveTowards( this.doctor );
        this.checkCollision( i );
      }
    },

    //----------------------------------------
    // did this dalek run into something?
    checkCollision: function( inIndex ) { 
      var inDalek = this.daleks[inIndex];

      if ( inDalek.collidedWith( this.doctor )) {
        this.lose();
        return;
      }

      for (var i in this.rubble) {
        if ( inDalek.collidedWith( this.rubble[i] )) {
          // boom
          this.removeDalek( inIndex );
        }
      }

      for (i in this.daleks) {
        if (inDalek.collidedWith( this.daleks[i] )) {
          // boom!
          var rubble = new Daleks.Piece("rubble");
          this.rubble[this.rubble.length] = rubble;            
          this.board.placeRubble( rubble, inDalek.x, inDalek.y );

          this.removeDalek( i );
          this.removeDalek( inIndex );
        }
      }

    },

    //----------------------------------------
    removeDalek: function( index ) {
      this.board.remove( this.daleks[index] );
      delete this.daleks[index];
      this.score++;
    },

    //----------------------------------------
    // randomly jump doctor, no guarantee of landing place
    teleport: function() {
      alert("teleporter broken!");
      // move doctor randomly  TODO
      this.updateWorld();
    },

    //----------------------------------------
    // move Daleks inexorably towards the Doctor
    lastStand: function() {
      // TODO
      alert("run!");
    },

    //----------------------------------------
    // kill the nearest daleks and continue
    sonicScrewDriver: function() {
      
      var x = this.doctor.x;
      var y = this.doctor.y;
      
      for (var i in this.daleks) {
        var dalek = this.daleks[i];
        if (((dalek.x === x) || (dalek.x === x+1) || (dalek.x === x-1)) &&
            ((dalek.y === y) || (dalek.y === y+1) || (dalek.y === y-1))) 
        {
          this.removeDalek(i);
        }
      }

      this.updateWorld();
    },

    //----------------------------------------
    win: function() {
      this.endGame();

      $(".victory").show();
      
      var self = this;
      $("body").one("click", function() {
                     self.startNextLevel();  
                   });
    },

    //----------------------------------------
    lose: function() {
      this.endGame();

      // TODO animate
      this.doctor.getEl().addClass("dead");

      $(".loser").show();
      
      var self = this;
      $("body").one("click", function() {
                      self.level = 0;
                      self.startNextLevel();  
                   });
    },
    
    //----------------------------------------
    endGame: function() {
      this.gameOver = true;
      this.controls.disable();
      this.disableKeyboardShortcuts();
    }
    
    // respond to player
    // move: function( dir ) {
    //   // setInterval( function() { animation.animate() }, 50 );
    // }
  };

  return GameController;
})();

var game = new Daleks.GameController( $(".arena") );
game.startNextLevel();
game.play();


$(document).ready( function() 
{
  // setInterval( function() { animation.animate() }, 50 );
});

