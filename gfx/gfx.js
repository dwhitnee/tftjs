//----------------------------------------------------------------------
//  Graphics utils
//----------------------------------------------------------------------

//----------------------------------------------------------------------
//  Take all arguments and place them in the new class's prototype
//
// Is this correct?
//
//   DefineClass is a function that returns a constructor function.
// The constructor function calls initialize() with its arguments.

// The parameters to DefineClass have their prototypes or themselves
// merged with the constructor function's prototype.

// Finally, the constructor function's prototype is merged with the constructor
// function. So you can write Shape.getArea.call(this) instead of
// Shape.prototype.getArea.call(this).
//----------------------------------------------------------------------
DefineClass = function() {

    // Constructor just calls init()
    var c = function() {
        this.init.apply( this, arguments );
    };

    c.prototype = {};

    $.each( arguments,
            function( i, arg ) {
                if (arg.prototype) {
                    $.extend( c.prototype, arg.prototype);  // inheritance
                } else {
                    $.extend( c.prototype, arg );  // aggregation
                }
            });

    // allow Foo.Blah.twist() to be called instead of Foo.Blah.protoype.twist()
    // within the class definition.
    $.extend( c, c.prototype );

    return c;
};

var Gfx = {};

// TODO:  Objectify Canvas?  GraphicsContext?

Gfx.Canvas = DefineClass(
{
    //----------------------------------------
    // takes a <canvas> HTML Element
    //----------------------------------------
    init: function( canvas ) {
        try {
            this.gl = canvas.getContext('2d');

            this.gl.viewportWidth  = canvas.width;
            this.gl.viewportHeight = canvas.height;
        }
        catch(e) {

        }
        if (!this.gl) { alert("Could not initialize graphics.  Sorry."); }

        return this.gl;
    },

    // wipe screen
    clear: function() {
        this.gl.clearRect( 0, 0, this.gl.viewportWidth, this.gl.viewportHeight );
    },

    //----------------------------------------
    // clear canvas, leave trail of 15% fade by default
    //----------------------------------------
    clearWithFade: function( fade ) {
        this.gl.save();

        // wipe out 10% of last image (fade)
        this.gl.fillStyle = 'rgba(255,255,255, ' + fade || 0.15 + ')';
        this.gl.fillRect( 0, 0, gl.viewportWidth, gl.viewportHeight );

        this.gl.restore();
    }

});


//----------------------------------------
//  Animation utils to adjust frame rate
//----------------------------------------
Gfx.Animation = DefineClass(
{
    framePause: 40,     // time to wait between draw()s
    frameCount: 0,      // total frames drawn, for measuring fps
    fps: 30,            // frameCount/(now-start)

    drawTimer: undefined,  // timer object to fire draw()

    init: function() { },

    //----------------------------------------------------------------------
    // expects static drawing function, scope must be provided.
    // Ex: Gfx.Animation.start( function() { app.draw(); });
    //----------------------------------------------------------------------
    start: function( drawFn ) {
        this.animationStart = new Date();
        this.frameCount = 0;
        // this.drawTimer = setInterval( this.drawFn, this.framePause );
        clearTimeout( this.drawTimer );

        // call draw routine with given scope, if any
        this.drawFn = drawFn;
//         this.drawTimer = setTimeout( this.drawFn.bind( scope ), 
//                                      this.framePause );
        this.drawTimer = setTimeout( this.drawFn, this.framePause );
    },
    stop: function() {
        // clearInterval( this.drawTimer );
        clearTimeout( this.drawTimer );
        this.drawTimer = undefined;
    },
    isRunning: function() {
        return this.drawTimer !== undefined;
    },
    //----------------------------------------
    // a frame of animation is done, calculate frames/sec (fps)
    // and adjust the animation timeout accordingly
    //----------------------------------------
    frameStart: function() {
        this.frameStartTime = new Date();
    },

    frameDone: function() {
        var duration = new Date() - this.frameStartTime;
        this.frameCount += 1;

        this.fps = Math.floor( 1000 * this.frameCount /
                               (new Date() - this.animationStart));

        // increase or decrease pause between frames if necessary
        // This doesn't work since fps will never increase
        // if (this.fps < (1000 / this.framePause)) {

        // monopolize 2/3 of the time to render.
        if ((1.5*duration) > this.framePause) {
            this.framePause = Math.floor( this.framePause * 1.20 );
        } else {
            this.framePause = Math.floor( this.framePause * 0.99 );
        }

        // no need to go faster than 25 fps
        if (this.framePause < 40) {
            this.framePause = 40;
        }

        // wait a bit before next frame
        clearTimeout( this.drawTimer );
        this.drawTimer = setTimeout( this.drawFn, this.framePause );
    }

});



//----------------------------------------
//  utils for loading pngs and drawing them as objects
//----------------------------------------
Gfx.Image = DefineClass(
{
    init: function( src ) {
        this.image = new Image();
        this.image.src = src;
        this.loaded = false;
        this.image.onLoad = Gfx.Image.onLoad.call( this );
    },
    onLoad: function() {
        this.loaded = true;
    },

    //----------------------------------------
    // center an image of this size on coordinate system
    // e.g. Images 0,0 is upper left, make 0,0 be the middle of object
    // make an image be 'size' high and wide, and draw it.
    //----------------------------------------
    drawCentered: function ( gl, size ) {
        if (!this.image.width || !this.image.height) {
	    return;
        }

        gl.save();

        gl.translate( -size/2, -size/2 );
        gl.scale( size / this.image.width, size / this.image.height );

        try {
            gl.drawImage( this.image, 0,0 );
        }
        catch( e ) { // don't fail if image not loaded yet
        }

        gl.restore();    // pop image-related transforms
    }
});













//----------------------------------------------------------------------
Gfx.roundedRect = function( gl, x,y, w,h, radius ) {
    gl.beginPath();

    gl.moveTo( x,y+radius );
    gl.lineTo( x,y+h-radius );
    gl.quadraticCurveTo( x,y+h,x+radius,y+h );
    gl.lineTo( x+w-radius,y+h );
    gl.quadraticCurveTo( x+w,y+h,x+w,y+h-radius );
    gl.lineTo( x+w,y+radius );
    gl.quadraticCurveTo( x+w,y,x+w-radius,y );
    gl.lineTo( x+radius,y );
    gl.quadraticCurveTo( x,y,x,y+radius );

    gl.stroke();
};

