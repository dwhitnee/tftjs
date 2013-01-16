Daleks.GameController = (function()
{
  function GameController( canvas ) {
    var self = this;
    this.board = new Daleks.Board( 30, 20 );
    canvas.append( this.board.getEl() );
  }

  GameController.prototype = {

    // create N daleks, and a player, add them to the board
    initLevel: function( level ) {

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
      for (var i=0; i < 5*level; i++) {
        this.daleks[i] = new Daleks.Piece("dalek");
        this.board.placeDalek( this.daleks[i] );
      }

      this.controls.update( this.doctor, this.board, this.daleks );
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
    },

    // start event listeners, wait for input, then move and deal
    play: function() {
      this.gameOver = false;
      this.draw();
      
      $(".lastStandButton"). on("click",  function() { self.lastStand(); });
      $(".screwDriverButton"). on("click", function() { self.sonicScrewDriver(); });

      this.board.getEl().on(
        "keydown", 
        function(e) { 
          if (e.target === "s") { self.sonicScrewDriver(); }
          if (e.target === "l") { self.lastStand(); }
        });
      
      // var x = 0;
      // do {
      //   this.moveDaleks();
      //   this.draw();
      // } while (x++ < 10);
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
    },

    moveDaleks: function() {
      for (var i in this.daleks) {// not a for loop beacuse this array is sparse
        var dalek = this.daleks[i];
        dalek.moveTowards( this.doctor );
        this.checkCollision( i );
      }
    },

    // did this dalek run into something?
    checkCollision: function( inIndex ) { 
      var inDalek = this.daleks[inIndex];

      if ( inDalek.collidedWith( this.doctor )) {
        this.endGame();
        return;
      }

      for (var i in this.rubble) {
        if ( inDalek.collidedWith( this.rubble[i] )) {
          // boom
          this.board.remove( this.daleks[inIndex] );
          delete this.daleks[inIndex];
        }
      }

      for (i in this.daleks) {
        if (inDalek.collidedWith( this.daleks[i] )) {
          // boom!
          var rubble = new Daleks.Piece("rubble");
          this.rubble[this.rubble.length] = rubble;            
          this.board.placeRubble( rubble, inDalek.x, inDalek.y );

          this.board.remove( this.daleks[i] );
          this.board.remove( this.daleks[inIndex] );
          delete this.daleks[i];
          delete this.daleks[inIndex];
        }
      }

    },

    // move Daleks inexorably towards the Doctor
    teleport: function() {
      alert("teleporter broken!");
    },

    // move Daleks inexorably towards the Doctor
    lastStand: function() {
      alert("run!");
    },

    sonicScrewDriver: function() {
      alert("sonic screwdriver's busted! fix me.");
    },

    endGame: function() {
      // alert("ow!");
      this.controls.disable();
      this.doctor.getEl().addClass("dead");
      this.gameOver = true;
      // disable controls
      // display score?
      // start again button?
    }
    
    // respond to player
    // move: function( dir ) {
    //   // setInterval( function() { animation.animate() }, 50 );
    // }
  };

  return GameController;
})();

var game = new Daleks.GameController( $(".arena") );
game.initLevel( 1 );
game.play();


$(document).ready( function() 
{
  // setInterval( function() { animation.animate() }, 50 );
});

