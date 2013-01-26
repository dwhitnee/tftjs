//----------------------------------------------------------------------
// A Piece occupies a space on the board that no one else can occupy.
//----------------------------------------------------------------------
Daleks.Piece = (function()
{
  function Piece( className, args ) {
    args = args || {};

    this.pos = { x: 0, y: 0 };
    this.size = 16;
    this.isAnimating = false;
    this.frameCount = args.frameCount || 8;

    this.el = $('<div class="piece ' + className + '"/>');
    // this.hide();   // hide until position set
  }
  
  Piece.prototype = {

    getEl: function() { return this.el; },

    // deep copy new position
    setPosition: function( inPos ) {
      this.pos.x = inPos.x;
      this.pos.y = inPos.y;
    },

    // center point of piece on screen in pixels
    getScaledCenterPos: function() {
      var pos = this.getScaledPos( this.pos );
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

    // a Piece finished animating.  now what?  
    finishAnimation: function() {
      this.isAnimating = false;
    },

    //----------------------------------------
    // move smoothly from one point to another
    // this is done asynchronously and ends when "to" point is reached.
    animateTo: function( toPos ) {
      this.isAnimating = true;

      var start = this.getScaledPos( this.pos );
      var end   = this.getScaledPos( toPos );

      var interval = {
        x: end.x - start.x,
        y: end.y - start.y
      };

      var self = this;
      var i = 1;

      var nextFrame = function() {
        self.drawAt( { x: start.x + (interval.x / self.frameCount)*i, 
                       y: start.y + (interval.y / self.frameCount)*i });
        if (++i <= self.frameCount) {
          // globalIAmAnimatingStill = true;  TODO - how to block until done?
          // or interrupt
          setTimeout( nextFrame, 50 );
         } else {
           self.finishAnimation();
         }
      };
      nextFrame.call();
    },

    draw: function() {
      this.drawAt( this.getScaledPos( this.pos ));
    },
        
    // draw using CSS
    drawAt: function( pos ) {
      this.el.css("left", pos.x );
      this.el.css("bottom", pos.y );
    },

    //----------------------------------------
    // move piece one towards given location (the Doctor)
    moveTowards: function( dest ) {
      var to = {  // deep copy
        x: this.pos.x,
        y: this.pos.y
      };

      if (this.pos.x > dest.pos.x) { to.x--; }
      if (this.pos.x < dest.pos.x) { to.x++; }
      if (this.pos.y > dest.pos.y) { to.y--; }
      if (this.pos.y < dest.pos.y) { to.y++; }
      
      this.slideTo( to );
    },

    //----------------------------------------
    // update logical position, and animate a transition to there on screen
    slideTo: function( newPos ) {
      // start animation first (perhaps set should be a after-callback?
      this.animateTo( newPos );

      this.setPosition( newPos );
    },
    
    // @return true if two distinct pieces are in the same place 
    //              (and not identical)
    collidedWith: function( target ) {
      return (this != target) && 
        (this.pos.x === target.pos.x) && 
        (this.pos.y === target.pos.y);
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
