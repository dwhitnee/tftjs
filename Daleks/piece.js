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

    // draw using CSS
    draw: function() {
      this.el.css("left", this.x * this.size );
      this.el.css("bottom", this.y * this.size );
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
