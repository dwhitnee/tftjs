// js for TFT

// Stories
// X ijkl keys will move sprite
// X wasd will move second sprite
// X sprite leaves wall
// X  does wall need redraw and memory?
// 
// Add explosion sound
// Add guaranteed frame rate (experimental)
// Add Scoring
// Host this
// Refactor
//  
// Remote players?
// Computer player?
// Replay game?
// Save game to Dynamo?
// Better Cycle sprite
//----------------------------------------------------------------------


//----------------------------------------------------------------------
//----------------------------------------------------------------------
TFT.Field = DefineClass(
{
    init: function( data ) {
        if (data) {
            $.extend( this, data );
        }
        this.width  = this.width || 800;
        this.height = this.height || 600;
        this.gridSpacing = this.gridSpacing || this.width / 10;
    },
    draw: function( gl ) {
        
        var x = this.width/2;
        var y = this.height/2;
        
        gl.save();
        var fieldColor = 100;
        
        // blank field
        
        gl.fillStyle = 'rgb( 100,100,100)';   // fill 
        
        gl.beginPath();
        gl.rect( -x, -y, this.width, this.height );
        gl.fill();
        
        gl.strokeStyle = 'rgb( 120,120,120)';   // grid line
        gl.lineWidth = 2;

        for (var xg = -x; xg < x; xg += this.gridSpacing) {
            gl.moveTo( xg, -y );
            gl.lineTo( xg, y );
            gl.stroke();
        }
        for (var yg = -y; yg < y; yg += this.gridSpacing) {
            gl.moveTo( -x, yg );
            gl.lineTo( x, yg );
            gl.stroke();
        }
        
        gl.restore();  // pop colors, styles
    }
});

TFT.App = DefineClass(
{
//     var scale = 1;

    //----------------------------------------
    start: function() {
        var app = this;
        Gfx.Animation.start( function() { app.update(); });
    },
    stop:  function() {
        Gfx.Animation.stop();
    },

    reset:  function() {
        this.initGame();
        this.initGraphics();
    },

    //----------------------------------------
    togglePause: function() {

        if (Gfx.Animation.isRunning()) {
            $("#play_btn").text("Start");
            this.stop();
        } else {
            $("#play_btn").text("Pause");
            this.start();
        }
    },

    //----------------------------------------
    init: function(){

        this.initHandlers();
        this.reset();
    },
    
    //----------------------------------------
    // Key Clicks
    //----------------------------------------
    initHandlers: function() {

        // zoom, keys don't work in FF3?
        var app = this;
        $(document).keydown(
            function( e ) {
                if (e.keyCode == 27) {  // esc
                    app.togglePause();
                    e.stopPropagation();
                }

                if (e.keyCode == 65) {  // 'a'
                    app.player1.turn('l');
                    e.stopPropagation();
                }
                if (e.keyCode == 68) {  // 'd'
                    app.player1.turn('r');
                    e.stopPropagation();
                }
                if (e.keyCode == 37) {  // left arrow
                    app.player2.turn('l');
                    e.stopPropagation();
                }
                if (e.keyCode == 39) {  // right arrow
                    app.player2.turn('r');
                    e.stopPropagation();
                }
            }
        );
        $("#play_btn").click( function() { app.togglePause(); } );
    },

    //----------------------------------------
    initGame: function() {
        this.player1 = new TFT.Player( 
            { name: "Red", 
              pos: [-200, 0],
              dir: Dir.RIGHT,
              color: "rgba( 100, 20, 0,.7)"
            });

        this.player2 = new TFT.Player( 
            { name: "Blue", 
              pos: [200, 0],
              dir: Dir.LEFT,
              color: "rgba( 0, 20, 100, .7)" 
            });

        this.field = new TFT.Field( { width: 750, height: 500 } );
    },

    //----------------------------------------
    initGraphics: function() {
        this.canvas = new Gfx.Canvas( $('#canvas')[0] );

        // gl.globalCompositeOperation = 'destination-over';
        this.canvas.gl.globalCompositeOperation = 'source-over';

        this.buildScene();
    },
    
    //----------------------------------------
    //  draw field and everyone on it,
    // needs to be static for callback, how to add scope?
    // FIXME: use requestAnimationFrame?
    //----------------------------------------
    draw: function() {
        Gfx.Animation.frameStart();

        this.canvas.clear();
        // canvas.clearWithFade( 0.50 );

        this.scene.traverse( this.canvas.gl );

        $("#fps").text("fps=" + Gfx.Animation.fps + ",  delay=" +
                       Gfx.Animation.framePause + "ms, c = " +
                       Gfx.Animation.frameCount );        

        Gfx.Animation.frameDone();
    },

    //----------------------------------------
    //  create scene graph, just the field for now
    //----------------------------------------    
    buildScene: function() {

        var app = this;
        var cameraView = {
            name: "Game Field View",
            xTrans: this.field.width/2,
            yTrans:  this.field.height/2,
            scale: 1,
            transform: function( gl ) {
                // move field centered on 0,0 to canvas of arbitrary size
                gl.translate( this.xTrans, this.yTrans );
                gl.scale( this.scale, -this.scale );   // flip Y axis
            }
        };

        this.scene = new Gfx.Group( { name: "Scene" } );

        var viewXform  = new Gfx.Transform( cameraView );
        viewXform.add( new Gfx.Geode( this.field ));
        
        viewXform.add( new Gfx.Geode( new TFT.PlayerGraphics( this.player1 )));
        viewXform.add( new Gfx.Geode( new TFT.PlayerGraphics( this.player2 )));

        this.scene.add( viewXform );
    },

    update: function() {
        this.player1.move();
        this.player2.move();

        this.draw();

        if (this.detectCollisions()) {
            this.stop();
            this.reset();
            $("#play_btn").text("Restart");
        }
    },

    detectCollisions: function() {
        if ( this.player1.interects( this.player2 )) {
            alert("Boom! Tie.");
            return true;
        }
        if (this.player1.hitsWall( this.player1 ) ||
            this.player1.hitsWall( this.player2 ))
        {
            alert("Blue wins!");
            return true;
        }
        if (this.player2.hitsWall( this.player2 ) ||
            this.player2.hitsWall( this.player1 )) 
        {
            alert("Red  wins!");
            return true;
        }
        return false;
    }
    
});


// crank this sucker up!
$(document).ready( function() {
    var tft = new TFT.App();
    tft.draw();  // just once
});


