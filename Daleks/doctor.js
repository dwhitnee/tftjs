var Daleks = Daleks || {};

//----------------------------------------------------------------------
// The Doctor and his movement
//----------------------------------------------------------------------
Daleks.Directions = (function()
{
  function Directions( doctor ) {
    this.piece = piece;
    this.dirs = ["n","ne","e","se","s","sw","w","nw"];
    this.arrows = [];
    for (var i=0; i < this.dirs.length; i++) {
      var arrowPiece = new Piece("arrow " + this.dirs[i]);
      arrowPiece.dir = this.dirs[i];
      this.arrows.push( arrowPiece );
    }
  }
  
  Directions.prototype = {

    // move arrow pieces around the doctor
    updateArrows: function() {
      for (var i = 0; i < this.arrows; i++) {
        var el = this.arrows[i].getEl();
        el.on("click", this.arrows[i], function(e) {
                doctor.move( dir );
              });
      }
    },

    // move arrow pieces around the doctor
    updateArrows: function() {
      
      for (var i = 0; i < this.arrows; i++) {
        var x = this.piece.x;
        var y = this.piece.y;
        var arrow = this.arrows[i];
        if (arrow.dir.match("n")) {  y += 1; }
        if (arrow.dir.match("e")) {  x += 1; }
        if (arrow.dir.match("s")) {  y -= 1; }
        if (arrow.dir.match("w")) {  x -= 1; }
      
        arrow.setPosition( x, y );
        // disable illegal arrows
      }
    }

  };

  // Private functions
  function _doSomethingPrivate() {
    return "secret!";
  };
  
  return Directions;
})();
