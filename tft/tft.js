// js for TFT

// Stories
// ijkl keys will move sprite
// wasd will move second sprite
// sprite leaves wall
//   does wall need redraw and memory?
//----------------------------------------------------------------------

var TFT = {};

var Dir = {
    LEFT: Math.PI,
    RIGHT: 0,
    UP:  Math.PI/2,
    DOWN: -Math.PI/2
};

//----------------------------------------------------------------------
//----------------------------------------------------------------------
TFT.Player = DefineClass(
{
    init:  function( data ) {
        if (data) {
            $.extend( this, data );
        }
        this.wall = [[this.pos[0], this.pos[1] ]];   // list of x,y vertices
    },
    
    move: function() {
        var dist = 2;
        if (this.dir == Dir.LEFT)  { this.pos[0] -= dist; }
        if (this.dir == Dir.RIGHT) { this.pos[0] += dist; }
        if (this.dir == Dir.UP)    { this.pos[1] += dist; }
        if (this.dir == Dir.DOWN)  { this.pos[1] -= dist; }
    },
    
    turn: function( dir ) {
        if (dir=='r') {
            this.dir -= Math.PI/2;
        } else {
            this.dir += Math.PI/2;
        }
        // normalize
        if (this.dir > Math.PI) {
            this.dir -= 2*Math.PI;
        }
        if (this.dir <= -Math.PI) {
            this.dir += 2*Math.PI;
        }
        
        this.wall.push( [this.pos[0], this.pos[1]] );
    }
});

//----------------------------------------------------------------------
//----------------------------------------------------------------------
TFT.PlayerGraphics = DefineClass(
{
    init: function( player ) {
        this.player = player;
    },
    
    draw: function( gl ) {
        this.drawWall( gl );
        this.drawCycle( gl );
    },
    
    drawWall: function( gl ) {
        gl.save();
        gl.strokeStyle = this.player.color;  // make separate?
        
        var wall = this.player.wall;
        gl.moveTo( wall[0][0], wall[0][1] );
        for (var i = 1; i < wall.length; i++) {
            gl.lineTo( wall[i][0], wall[i][1] );
        }
        gl.lineTo( this.player.pos[0], this.player.pos[1] );
        
        gl.stroke();
        gl.restore();
    },
    
    drawCycle: function( gl ) {
        gl.save();
        this.transform( gl );   // could make a node out of this
                
        gl.fillStyle = this.player.color;
        gl.beginPath();
        gl.rect( -10, -5, 20, 10 );   // tlx, tly, w, h
        gl.fill();
        gl.restore();
    },
    
    transform: function( gl ) {
        gl.translate( this.player.pos[0], this.player.pos[1] );
        gl.rotate( this.player.dir );
    }
    
});

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
});

TFT.App = DefineClass(
{
//     var scale = 1;

    //----------------------------------------
    start: function() {
        var app = this;
        Gfx.Animation.start( function() { app.draw(); });
    },
    stop:  function() {
        Gfx.Animation.stop();
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
        this.initGame();
        this.initGraphics();
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
    //----------------------------------------
    draw: function() {
        this.act();
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

    act: function() {
        this.player1.move();
        this.player2.move();
    }

});


// crank this sucker up!
$(document).ready( function() {
    var tft = new TFT.App();
    tft.draw();  // just once
});


