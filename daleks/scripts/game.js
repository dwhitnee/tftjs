Daleks.GameController = (function()
{
  "use strict";
  
  var _click = "click";
  // var _click = "tapone";

  function GameController( canvas ) {
    var self = this;

    this.board = new Daleks.Board( 30, 20 );
    this.gameData = new Daleks.GameData();

    canvas.append( this.board.getEl() );

    this.resetGame();

    // this is always enabled
    this.panicButton = $(".button[data-name=abort]");
    this.panicButton.on( _click, function(e) {
                          e.preventDefault();
                          self.restoreControls();
                          return false;
                        });
  }

  GameController.prototype = {

    // create N daleks, and a player, add them to the board
    // start event listeners, wait for input, then move and deal
    startNextLevel: function() {
      this.level++;
      this.screwdriversLeft = 1;
      this.roundOver = false;
      this.board.clear();
      this.isAnimating = false;

      $(".gameover").hide();
      $(".loading").hide();
      $("#highScore").text( this.gameData.getHighScore() );

      this.doctor = new Daleks.Piece("doctor", { frameCount: 4 });

      this.controls = new Daleks.DoctorControls( 
        this.board, 
        {
          fn: this.handleMove, 
          scope: this 
        });

      this.restoreControls();

      this.board.placeDoctor( this.doctor );

      this.rubble = [];
      this.daleks = [];
      for (var i = 0; i < 5 * this.level; i++) {
        this.daleks[i] = new Daleks.Piece("dalek");
        this.board.placeDalek( this.daleks[i], this.doctor );
      }

      this.draw();
    },

    // callback for an arrow being clicked or other move instruction
    handleMove: function( dir ) { 
      this.controls.moveDoctor( this.doctor, dir ); 
      this.updateWorld(); 
    },

    // Update the css for all elements
    draw: function() {
      // for (var i in this.daleks) {
      //   this.daleks[i].draw();
      // }

      // this.doctor.draw();  // animated elsewhere

      for (var i in this.rubble) {
        this.rubble[i].draw();
      }

      this.updateControls();   // draws controls as well

      $("#level").text( this.level );
      $("#score").text( this.score );
    },

    //----------------------------------------
    // enable buttons and keyboard event handlers
    enableControls: function() {
      this.disableControls();  // make sure no handler leaks
      var self = this;
      $(".button").removeClass("disabled");

      $("body").on("keydown",
        function(e) { 
          switch (e.which) {
            case 76: self.lastStand(); break; 
            case 83: self.sonicScrewDriver();  break;
            case 84: self.teleport(); break;
          }
        });

      // data-name is the function to call on click
      $(".actions").on( _click, "a", function(e) {
                         e.preventDefault();
                         var fn = $(e.target).closest('a').data('name');
                         if (self[fn]) {
                           self[fn].call( self );
                         }
                         return false;
                      });

      this.updateScrewDriver();
    },

    disableControls: function() {
      this.controls.disable();
      $("body").off("keydown");
      $(".actions").off( _click, "a");
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

    // @return true of any daleks or the doctor are an in-progress animation
    animationInProgress: function() {
      for (var i in this.daleks) {
        if (this.daleks[i].isAnimating) {
          return true;
        }
      }

      return this.doctor.isAnimating || this.isAnimating;
    },

    //----------------------------------------
    // the doctor made a move, respond
    updateWorld: function() {
      
      var self = this;
      var tryAgain = function() {
        self.updateWorld();
      };
      
      // Wait until doctor has moved
      if (this.animationInProgress()) {
        setTimeout( tryAgain, 100 );
        return;
      }

      this.moveDaleks();
      this.checkWorld();
    },

    checkWorld: function() {

      // can this logic be centralized (checkConditionAndTryAgain() )
      var self = this;
      var tryAgain = function() {
        self.checkWorld();
      };
      
      // wait until animations done
      if (this.animationInProgress()) {
        setTimeout( tryAgain, 100 );
        return;
      }

      this.checkCollisions();  // TODO remove pieces after animation is complete

      if (!this.roundOver) {
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
      
      // keep going until round over
      if (!this.roundOver && this.isLastStand) {
        this.updateWorld();
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
        this.loseGame();
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
      this.isAnimating = true;

      this.disableControls();

      var epicenter = this.doctor.getScaledCenterPos();

      this.board.remove( this.doctor );

      var disappear = new Daleks.Animation.SonicPulse( 
        {
          container: this.board.getEl(), 
          epicenter: epicenter,
          innerDiameter: 48, 
          outerDiameter: 480,
          callback: {
            success: this.teleportReappear,
            context: this
          }
        });

      disappear.start();
    },

    //----------------------------------------
    // reppear after disappear is done
    teleportReappear: function() {

      // someplace brand new!
      this.board.placeDoctor( this.doctor );
      var epicenter = this.doctor.getScaledCenterPos();

      // depends on being called with "this" as context
      var reappearDone = function() {
        this.doneAnimating();
        this.enableControls();
        this.updateWorld();
      };

      var reappear = new Daleks.Animation.SonicPulse( 
        {
          container: this.board.getEl(), 
          epicenter: epicenter,
          innerDiameter: 48,
          outerDiameter: 480,
          reverse: true,
          callback: {
            success: reappearDone,
            context: this
          }
        });

      reappear.start();
    },

    doneAnimating: function() {
      this.isAnimating = false;
    },
    
    //----------------------------------------
    // move Daleks inexorably towards the Doctor
    lastStand: function() {
      this.isLastStand = true;
      this.controls.disable();
      this.disableControls();
      $(".button").addClass("disabled");

      this.panicButton.removeClass("disabled");
      this.panicButton.show();

      this.updateWorld();
    },

    // oops! User didn't mean to last stand, cancel it.
    restoreControls: function() {
      this.isLastStand = false;
      this.enableControls();
      this.panicButton.hide();
    },

    // hide screw driver button if used
    updateScrewDriver: function() {
      if (this.screwdriversLeft <= 0) {
        $(".button[data-name=sonicScrewDriver]").addClass("disabled");
      }
    },

    //----------------------------------------
    // kill the nearest daleks and continue
    sonicScrewDriver: function() {
   
      if (this.screwdriversLeft <= 0) {
        return;
      }

      this.screwdriversLeft--;
      this.updateScrewDriver();

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
      $("body").one( _click, function() {
                      self.startNextLevel();
                      return false;
                    });
    },

    //----------------------------------------
    loseGame: function() {
      this.endRound();

      // TODO animate
      this.doctor.getEl().addClass("dead");

      $(".loser").show();
      
      this.gameData.setHighScore( this.score );
      $("#highScore").text( this.gameData.getHighScore() );
      $("#highScores").show();

      var self = this;
      $("body").one( _click, function() {
                      self.resetGame();
                      self.startNextLevel();  
                      return false;
                   });

    },
    
    //----------------------------------------
    endRound: function() {
      this.roundOver = true;
      this.disableControls();

      // do this separately to prevent panic button form getting
      // disabled on every animation.
      this.panicButton.hide();   
    },
    
    resetGame: function() {
      this.score = 0;
      this.level = 0;
    }
  };

  return GameController;
})();



$(document).ready( function() 
{
  var game = new Daleks.GameController( $(".arena") );
  game.startNextLevel();
});

