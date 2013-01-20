var Daleks = Daleks || {};
Daleks.Animation = Daleks.Animation || {};

//----------------------------------------------------------------------
// A Piece occupies a space on the board that no one else can occupy.
//----------------------------------------------------------------------
Daleks.Animation.SonicPulse = (function()
{
  function SonicPulse( args ) {

    this.container = args.container;
    this.reverse = args.reverse;  // whether to expand or collapse
    this.setPosition( args.epicenter.x, args.epicenter.y );
    this.innerDiameter = args.innerDiameter || 16;
    this.outerDiameter = args.outerDiameter || 48;
    this.numCircles = 5;
    this.drawInterval = 50;  // ms between frames
    this.circle = [];

    // outer container
    this.el = $('<div class="sonicPulse"/>');
    this.el.css("width",  this.outerDiameter );
    this.el.css("height", this.outerDiameter );
    
    var gap = (this.outerDiameter - this.innerDiameter)/(this.numCircles-1);

    for (var i = 0; i < this.numCircles; i++) {
      var diameter = this.innerDiameter + i*gap;  
      var circle = $('<div class="pulse">');
      circle.css("width", diameter );
      circle.css("height", diameter );
      circle.css("left", (this.outerDiameter - diameter)/2 );  // center circles
      circle.css("top",  (this.outerDiameter - diameter)/2 );

      this.circle[i] = circle;
      this.el.append( circle );
    }
  }
  
  SonicPulse.prototype = {

    getEl: function() { return this.el; },

    setPosition: function( x, y ) {
      this.x = x;
      this.y = y;
    },

    // draw using CSS
    draw: function() {
      // center bounding box on 16px block
      // why the 1?
      this.el.css("left",   this.x - this.outerDiameter/2 - 1);
      this.el.css("bottom", this.y - this.outerDiameter/2 + 1);
    },

    inward: function() {
    },
    outward: function() {
    },
    
    //----------------------------------------
    // Do one frame of animation, then set callback for next frame.
    // First (fadingInMode) draw (show) each concentric circle until are shown
    // then switch to fadeOut to hide them.
    animateNextFrame: function() {

      if (this.fadingInMode) {
        this.circle[this.current].show();
      } else {
        this.circle[this.current].hide();
      }
      
      if (this.reverse) {
        this.current--;
      } else {
        this.current++;
      }

      // done with all cirlces? change modes
      if ((this.current >= this.numCircles) || (this.current <= 0)) {

        if (!this.fadingInMode) {
          // exit condition. All circles hidden.
          this.end();
          return;
        } else {
          // all circles are shown, now hide them (fade out)
          this.fadingInMode = !this.fadingInMode;

          this.resetToFirstCircle();
        }
      };

      var self = this;
      var drawNextFrame = function() {
        self.animateNextFrame();
      };
      // is creating functions like this expensive? FIXME
      setTimeout( drawNextFrame, this.drawInterval );
    },

    resetToFirstCircle: function() {
      if (this.reverse) {
        this.current = this.numCircles - 1;  // start at outer ring
      } else {
        this.current = 0;   // start at inner ring
      }
    },

    //----------------------------------------
    // start async animation loop where we radiate out and then fade.
    // Animation will complete independently of any other actions.
    // Animation can be restarted at any time.
    //----------------------------------------
    start: function() {
      this.container.append( this.el );
      this.draw();

      this.resetToFirstCircle();

      this.fadingInMode = true;
      this.animateNextFrame();
    },

    end: function() {
      this.el.remove();
    },

    _doSomethingQuasiPrivate: function() {
        return true;
      }
    };

    // Private functions
    function _doSomethingPrivate() {
        return "secret!";
    };

    return SonicPulse;
})();
