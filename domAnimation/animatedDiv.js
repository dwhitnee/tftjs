//----------------------------------------------------------------------
// div element that can be positioned absolutely and animated.
//----------------------------------------------------------------------
var AnimatedDiv = (function()
{
  function AnimatedDiv( x, y, text ) {
    this.x = x || 100;
    this.y = y || 100;
    this.text = text || "Hello";
    this.dx = 2;
    this.dy = 1;
    this.dSize = 1;
    this.el = $('<div/>').css("position","absolute").text( this.text );
  }
  
  AnimatedDiv.prototype = {

    getEl: function() { return this.el; },

    bounceHorizontal: function() {
      this.dx = - this.dx;
    },
    bounceVertical: function() {
      this.dy = - this.dy;
    },
    
    scale: function() {
      this.size += this.dSize;
    },

    translate: function() {
      this.x += this.dx;
      this.y += this.dy;
    },

    rotate: function() {
//      this.theta += this.dTheta;
    },

    // draw using CSS
    draw: function() {
      this.el.css("left", this.x);
      this.el.css("bottom", this.y);
      this.el.css("font-size", this.size + " px");
      // this.el.css("rotation foo");
    },

    // update world based on physics rules
    update: function() {
      this.translate();
      this.scale();
      this.rotate();
    },

    // does this belong here?  Need a collision detector of some sort
    bounceAtBorders: function( x, y ) {
      if ((this.x > x) || (this.x <= 0)) {
        this.bounceHorizontal(); 
        // fixme
      }
      if ((this.y > y) || (this.y <= 0)) { this.bounceVertical(); }
    },

    _doSomethingQuasiPrivate: function() {
        return true;
      }
    };

    // Private functions
    function _doSomethingPrivate() {
        return "secret!";
    };

    return AnimatedDiv;
})();


var AnimationController = (function()
{
  function AnimationController( canvas ) {
    this.word = new AnimatedDiv( 50,50, "Hi" );
    canvas.append( this.word.getEl() );
  }
  AnimationController.prototype = {

    // implied draw, using CSS
    animate: function() {
      this.updateWorld();
      this.word.draw();
    },
    
    updateWorld: function() {
      this.word.update();
      this.word.bounceAtBorders( 380, 180 );
    }
  };

  return AnimationController;
})();

var animation = new AnimationController( $(".field") );

$(document).ready( function() 
{
  setInterval( function() { animation.animate() }, 50 );
});

