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
    // start event listeners, wait for input, then move and deal
    startNextLevel: function() {
      this.level++;
      this.screwdriversLeft = 1;
      this.roundOver = false;
      this.isLastStand = false;
      this.board.clear();

      $(".gameover").hide();
      $(".loading").hide();
      $("#highScore").text( this.gameData.getHighScore() );

      this.enableKeyboardShortcuts();

      this.doctor = new Daleks.Piece("doctor");

      this.controls = new Daleks.DoctorControls( 
        this.board, 
        {
          fn: this.handleMove, 
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

    // callback for an arrow being clicked or other move instruction
    handleMove: function( dir ) { 
      this.controls.moveDoctor( this.doctor, dir ); 
      this.updateWorld(); 
    },

    // Update the css for all elements
    // TODO: animate motion
    draw: function() {
      for (var i in this.daleks) {
        // this.daleks[i].draw();
      }
      for (i in this.rubble) {
        this.rubble[i].draw();
      }
      this.doctor.draw();
      this.controls.draw();

      $("#level").text( this.level );
      $("#score").text( this.score );
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
      if (!this.isLastStand) {
        this.controls.update( this.doctor, this.board, 
                              this.daleks.concat( this.rubble ));
      }
    },

    //----------------------------------------
    // the doctor made a move, respond
    updateWorld: function() {
      
      this.moveDaleks();
      this.checkCollisions();  // TODO remove pieces after animation is complete

      if (!this.roundOver) {
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
        this.winRound();
      }
    },

    //----------------------------------------
    moveDaleks: function() {
      for (var i in this.daleks) {// not a for loop beacuse this array is sparse
        var dalek = this.daleks[i];
        dalek.moveTowards( this.doctor );
      }
    },

    //----------------------------------------
    // did this dalek run into the Doctor or rubble?
    dalekCollidedWithLandscape: function( inDalek ) { 

      if ( inDalek.collidedWith( this.doctor )) {
        this.endGame();
        return false;
      }

      for (var i in this.rubble) {
        if ( inDalek.collidedWith( this.rubble[i] )) {
          return true;            // boom
        }
      }
      return false;
    },

    //----------------------------------------
    // make rubble where Daleks impacted each other
    // check for impact with existing landmarks first, 
    // then with other daleks - which will make a landmark for others to hit
    checkCollisions: function() {
      for (var i in this.daleks) {

        if (this.dalekCollidedWithLandscape( this.daleks[i] )) {
          this.removeDalek( i );
          continue;
        }

        for (var j in this.daleks) {
          if (this.daleks[i].collidedWith( this.daleks[j] )) {   // boom!

            var rubble = new Daleks.Piece("rubble");
            this.rubble[this.rubble.length] = rubble;            
            this.board.placeRubble( rubble, this.daleks[i].pos );
            this.removeDalek( i );   // will this screw up iteration?
            this.removeDalek( j );
            break;
          }
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
      this.isLastStand = true;
      this.controls.disable();

      var self = this;
      var nextStepFn = function() {      
        self.updateWorld();
        if (!self.roundOver) {
          setTimeout( nextStepFn, 400 );
        }
      };

      nextStepFn.call();
    },

    //----------------------------------------
    // kill the nearest daleks and continue
    sonicScrewDriver: function() {
   
      if (this.screwdriversLeft <= 0) {
        return;
      }

      this.screwdriversLeft--;
      var x = this.doctor.pos.x;
      var y = this.doctor.pos.y;

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
        var pos = this.daleks[i].pos;
        if (((pos.x === x) || (pos.x === x+1) || (pos.x === x-1)) &&
            ((pos.y === y) || (pos.y === y+1) || (pos.y === y-1))) 
        {
          this.removeDalek(i);
        }
      }

      this.updateWorld();
    },

    //----------------------------------------
    winRound: function() {
      this.endRound();

      $(".victory").show();
      
      var self = this;
      $("body").one("click", function() {
                      self.startNextLevel();
                    });
    },

    //----------------------------------------
    endGame: function() {
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
      this.roundOver = true;
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


$(document).ready( function() 
{
  // setInterval( function() { animation.animate() }, 50 );
});

