var Daleks = Daleks || {};

//----------------------------------------------------------------------
// The Doctor's movement arrows
//----------------------------------------------------------------------
Daleks.DoctorControls = (function()
{
  function DoctorControls( board, onAction ) {

    this.dirs = ["n","ne","e","se","s","sw","w","nw","x"];
    this.arrows = [];
    for (var i = 0; i < this.dirs.length; i++) {
      var arrowPiece = new Daleks.Piece("arrow " + this.dirs[i]);
      arrowPiece.dir = this.dirs[i];
      board.place( arrowPiece );
      this.arrows.push( arrowPiece );
      arrowPiece.getEl().on("click", { dir: this.dirs[i] }, 
                            function(e) {
                              var dir = e.data.dir;
                              onAction.fn.call( onAction.scope, dir );
                              return false;  // stop propagation of event
                            });
    }
  }
  
  DoctorControls.prototype = {

    disable: function() {
      for (var i = 0; i < this.arrows.length; i++) {
        this.arrows[i].getEl().hide();
      }
    },

    moveDoctor: function( doctor, dir ) {
      var newPos = _getNewPosition( doctor.x, doctor.y, dir );
      doctor.setPosition( newPos.x, newPos.y );
    },
    
    // move arrow pieces around the doctor
    // hade arrows that are illegal moves
    update: function( doctor, board, obstacles ) {
      
      for (var i = 0; i < this.arrows.length; i++) {
        var arrow = this.arrows[i];

        var arrowPos = _getNewPosition( doctor.x, doctor.y, arrow.dir );
        var x = arrowPos.x;
        var y = arrowPos.y;
      
        arrow.setPosition( x, y );        // disable illegal arrows
        var valid = true;

        // can't move off board
        if ((x >= board.width)  || (x < 0) || 
            (y >= board.height) || (y < 0))
        {
          valid = false;
        } else {
          // can't move into an object
          for (var j in obstacles) {
            if ((x == obstacles[j].x) && (y == obstacles[j].y)) {
              valid = false;
              break;
            }
          }
        }
        if (valid) {
          arrow.draw();
          arrow.show(); 
        } else {
          arrow.hide(); 
        }
      }
    },

    draw: function() {
      for (var i = 0; i < this.arrows.length; i++) {
        this.arrows[i].draw();
      }
    }

  };

  // @return pos if we moved in direction given (n,s,e,w,ne,nw,se,sw)
  function _getNewPosition( x, y, dir ) {
    if (dir.match("n")) {  y += 1; }
    if (dir.match("e")) {  x += 1; }
    if (dir.match("s")) {  y -= 1; }
    if (dir.match("w")) {  x -= 1; }
    return { x:x, y:y };
  };
  
  return DoctorControls;
})();
