// js for TFT

var gl, canvas;
var player1, player2;
var scene, field;
var scale = 1;

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


//----------------------------------------
// Key Clicks
//----------------------------------------
function initHandlers() {

    // zoom, keys don't work in FF3?
    $("#canvas").keydown(
        function( e ) {
            alert("key:", e);
            debugger;
        }
    );
}

//----------------------------------------------------------------------
//----------------------------------------------------------------------
function init(){

    initHandlers();
    initGame();

    initGraphics();
}

//----------------------------------------------------------------------
//----------------------------------------------------------------------
function initGame() {
    player1 = new TFT.Player("Red", -100, 0);
    player2 = new TFT.Player("Red", 100, 0);

    field = new TFT.Field( { width: 750, height: 500 } );
}

//----------------------------------------------------------------------
//----------------------------------------------------------------------
function initGraphics() {
    canvas = new Gfx.Canvas( $('#canvas')[0] );
    gl = canvas.gl;

    // gl.globalCompositeOperation = 'destination-over';
    gl.globalCompositeOperation = 'source-over';

    scene = buildScene();

    Gfx.Animation.start( draw );
}

//----------------------------------------------------------------------
//  draw field and everyone on it
//----------------------------------------------------------------------
function draw() {
    Gfx.Animation.frameStart();

    canvas.clear();
    // canvas.clearWithFade( 0.50 );

    scene.traverse( gl );
    Gfx.Animation.frameDone();
}

//----------------------------------------------------------------------
//  create scene graph, just the field for now
//----------------------------------------------------------------------
function buildScene() {

    var scene = new Gfx.Group( { name: "Scene" } );

    var viewXform  = new Gfx.Transform( view );
    scene.add( viewXform );

    viewXform.add( new Gfx.Geode( field ));

    return scene;
}


//----------------------------------------------------------------------
// camera view
//----------------------------------------------------------------------
var view = {
    name: "Field View",
    transform: function( gl ) {
        // move field centered on 0,0 to canvas of arbitrary size
        gl.translate( field.width/2, field.height/2 );
        gl.scale( scale, scale );
    }
};
