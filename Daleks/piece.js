var Daleks = Daleks || {};

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
      var pos = this.getScaledPos();
      pos.x = pos.x + this.size/2;
      pos.y = pos.y + this.size/2;
      return pos;
    },

    getScaledPos: function() {
      return {
        x: this.x * this.size,
        y: this.y * this.size
      };
    },

    // draw using CSS
    draw: function() {
      var pos = this.getScaledPos();
      this.el.css("left", pos.x );
      this.el.css("bottom", pos.y );
      // this.getEl().css("display", "inherit");
    },

    // move piece one towards given location (the Doctor)
    // TODO: animate this
    moveTowards: function( dest ) {
      if (this.x > dest.x) {  this.x--; }
      if (this.x < dest.x) {  this.x++; }
      if (this.y > dest.y) {  this.y--; }
      if (this.y < dest.y) {  this.y++; }
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
