// js for TFT

// Stories
// ijkl keys will move sprite
// wasd will move second sprite
// sprite leaves wall
//   does wall need redraw and memory?
//----------------------------------------------------------------------

var TFT = {};

TFT.Player = DefineClass(
    {
        init:  function( name, x, y ) {
            this.name = name;
            this.pos = [x,y]; 
            this.wall = [];   // list of x,y vertices
        }
    }
);

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
            var gridLineColor = 200;

            // blank field
             
            gl.fillStyle = 'rgba( 100,100,100, 1)';   // fill 

            gl.beginPath();
            gl.rect( -x, -y, this.width, this.height );
            gl.fill();

            gl.strokeStyle = 'rgba( 120,120,120, 1)';   // grid line

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
    }
);

TFT.App = DefineClass(
{

//     var gl, canvas;
//     var player1, player2;
//     var scene, field;
//     var scale = 1;
    
    //----------------------------------------
    // Key Clicks
    //----------------------------------------
    initHandlers: function() {

        // zoom, keys don't work in FF3?
        $("#canvas").keydown(
            function( e ) {
                alert("key:", e);
                debugger;
            }
        );
    },

    //----------------------------------------
    initGame: function() {
        this.player1 = new TFT.Player("Red", -100, 0);
        this.player2 = new TFT.Player("Red", 100, 0);

        this.field = new TFT.Field( { width: 750, height: 500 } );
    },

    //----------------------------------------
    initGraphics: function() {
        this.canvas = new Gfx.Canvas( $('#canvas')[0] );

        // gl.globalCompositeOperation = 'destination-over';
        this.canvas.gl.globalCompositeOperation = 'source-over';

        this.buildScene();
    },
    
    start: function() {
        var app = this;
        Gfx.Animation.start( function() { app.draw(); });
    },

    //----------------------------------------
    init: function(){

        this.initHandlers();
        this.initGame();
        this.initGraphics();
    },

    //----------------------------------------
    //  draw field and everyone on it,
    // needs to be static for callback, how to add scope?
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
                gl.scale( this.scale, this.scale );
            }
        };

        this.scene = new Gfx.Group( { name: "Scene" } );

        var viewXform  = new Gfx.Transform( cameraView );
        viewXform.add( new Gfx.Geode( this.field ));

        this.scene.add( viewXform );
    }

});


// crank this sucker up!
$(document).ready( function() {
    var tft = new TFT.App();
    tft.start();
});


