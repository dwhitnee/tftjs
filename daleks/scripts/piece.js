//----------------------------------------------------------------------
// A Piece occupies a space on the board that no one else can occupy.
//----------------------------------------------------------------------
Daleks.Piece = (function()
{
  function Piece( className ) {
    this.x = 0;
    this.y = 0;
    this.size = 16;

    this.el = $('<div class="piece ' + className + '"/>');
    // this.hide();   // hide until position set
  }
  
  Piece.prototype = {

    getEl: function() { return this.el; },

    setPosition: function( x, y ) {
      this.x = x;
      this.y = y;
    },

    // center point of piece on screen in pixels
    getScaledCenterPos: function() {
      var pos = this.getScaledPos( this );
      pos.x = pos.x + this.size/2;
      pos.y = pos.y + this.size/2;
      return pos;
    },

    getScaledPos: function( pos ) {
      return {
        x: pos.x * this.size,
        y: pos.y * this.size
      };
    },

    // move smoothly from one point to another
    animate: function( from, to ) {
      var start = this.getScaledPos( from );
      var end   = this.getScaledPos( to );

      var interval = {
        x: end.x - start.x,
        y: end.y - start.y
      };

      var self = this;
      var i = 1;
      var nextFrame = function() {
        self.drawAt( start.x + (interval.x/5)*i, start.y + (interval.y/5)*i);
        if (++i < 5) {
          setTimeout( nextFrame, 50 );
         }
      };
      setTimeout( nextFrame, 50 );
    },

    draw: function() {
      this.drawAt( this.getScaledPos( this ));
    },
        
    // draw using CSS
    drawAt: function( pos ) {
      this.el.css("left", pos.x );
      this.el.css("bottom", pos.y );
      window.console.log( pos.x + "," + pos.y );
    },

    // move piece one towards given location (the Doctor)
    // TODO: animate this
    moveTowards: function( dest ) {
      var from = { 
        x: this.x,
        y: this.y
      };
      var to = {
        x: this.x,
        y: this.y
      };

      if (this.x > dest.x) {  this.x--; to.x--; }
      if (this.x < dest.x) {  this.x++; to.x++; }
      if (this.y > dest.y) {  this.y--; to.y--; }
      if (this.y < dest.y) {  this.y++; to.y++; }
      
      // this.animate( from, to );
    },
    
    // @return true if two distinct pieces are in the same place 
    //              (and not identical)
    collidedWith: function( target ) {
      return (this != target) && (this.x === target.x) && (this.y === target.y);
    },          

    hide: function() {
      this.getEl().css("display","none");
    },
    show: function() {
      this.getEl().css("display","inherit");
    },

    _doSomethingQuasiPrivate: function() {
        return true;
      }
    };

    // Private functions
    function _doSomethingPrivate() {
        return "secret!";
    };

    return Piece;
})();
