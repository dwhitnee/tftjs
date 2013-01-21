Daleks.GameController = (function()
{
  function GameController( canvas ) {
    var self = this;
    this.board = new Daleks.Board( 30, 20 );
    this.gameData = new Daleks.GameData();

    canvas.append( this.board.getEl() );

    this.resetGame();
  }

  GameController.prototype = {

    // create N daleks, and a player, add them to the board
    startNextLevel: function() {
      this.level++;
      this.gameOver = false;
      this.screwdriversLeft = 1;
      this.board.clear();

      $(".gameover").hide();
      $("#highScores").hide();

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
        this.board.placeDalek( this.daleks[i], this.doctor );
      }

      this.updateControls();
      this.draw();
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

      $("#level").text( this.level );
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

    //----------------------------------------
    // place the control arrows in legal places
    // Take into acconut things to block arrows: daleks, borders, rubble
    updateControls: function() {
      this.controls.update( this.doctor, this.board, 
                            this.daleks.concat( this.rubble ));
    },

    //----------------------------------------
    // the doctor made a move, respond
    updateWorld: function() {
      
      this.moveDaleks();  // TODO check doctor collision, too

      if (!this.gameOver) {
        this.updateControls();
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
      this.updateScore( 1 );
    },

    updateScore: function( value ) {
      this.score += value;
      $("#score").text( this.score );
    },

    //----------------------------------------
    // randomly jump doctor, no guarantee of landing place
    teleport: function() {
      var epicenter = this.doctor.getScaledCenterPos();

      this.board.remove( this.doctor );
      this.controls.disable();

      var disappear = new Daleks.Animation.SonicPulse( 
        {
          container: this.board.getEl(), 
          epicenter: epicenter,
          innerDiameter: 48, 
          outerDiameter: 480 
        });
      disappear.start();

      // reppear after disappear is done
      var self = this;
      var reappearFn = function() {
        self.board.placeDoctor( self.doctor );
        self.updateWorld();

        epicenter = self.doctor.getScaledCenterPos();

        var reappearAnimation = new Daleks.Animation.SonicPulse( 
          {
            container: self.board.getEl(), 
            epicenter: epicenter,
            innerDiameter: 48,
            outerDiameter: 480,
            reverse: true
          });
        reappearAnimation.start();
      };
      setTimeout( reappearFn, 600 );

    },

    //----------------------------------------
    // move Daleks inexorably towards the Doctor
    lastStand: function() {
      this.controls.disable();

      var self = this;
      var nextStepFn = function() {      
        self.updateWorld();
        if (!self.gameOver) {
          setTimeout( nextStepFn, 500 );
        }
      };

      setTimeout( nextStepFn, 500 );
    },

    //----------------------------------------
    // kill the nearest daleks and continue
    sonicScrewDriver: function() {
   
      if (this.screwdriversLeft <= 0) {
        return;
      }

      this.screwdriversLeft--;
      var x = this.doctor.x;
      var y = this.doctor.y;

      var epicenter = this.doctor.getScaledCenterPos();
      var animation = new Daleks.Animation.SonicPulse( 
        {
          container: this.board.getEl(),
          epicenter: epicenter,
          innerDiameter: 16,
          outerDiameter: 48 
        });

      animation.start();
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
      this.endRound();

      $(".victory").show();
      
      var self = this;
      $("body").one("click", function() {
                      self.startNextLevel();
                    });
    },

    //----------------------------------------
    lose: function() {
      this.endRound();

      // TODO animate
      this.doctor.getEl().addClass("dead");

      $(".loser").show();
      
      this.gameData.setHighScore( this.score );
      $("#highScore").text( this.gameData.getHighScore() );
      $("#highScores").show();

      var self = this;
      $("body").one("click", function() {
                      self.resetGame();
                      self.startNextLevel();  
                   });

    },
    
    //----------------------------------------
    endRound: function() {
      this.gameOver = true;
      this.controls.disable();
      this.disableKeyboardShortcuts();
    },
    
    resetGame: function() {
      this.score = 0;
      this.level = 0;
    }
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

