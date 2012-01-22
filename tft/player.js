//----------------------------------------------------------------------
//----------------------------------------------------------------------

var TFT = TFT || {};

var Dir = {
    LEFT: Math.PI,
    RIGHT: 0,
    UP:  Math.PI/2,
    DOWN: -Math.PI/2
};

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
    },

    // account for rotation of player
    boundingBox: function() {
        if (this.dir == 0 || this.dir == Math.PI) {

            return {
                x0: this.pos[0]-10, y0: this.pos[1]-5, 
                x1: this.pos[0]+10, y1: this.pos[1]+5 };

        } else {            // rotated 90 or 270

            return {
                x0: this.pos[0]-5, y0: this.pos[1]-10, 
                x1: this.pos[0]+5, y1: this.pos[1]+10 };
        }
    },

    // make sure bounding box of wall segment is absolute value
    wallBox: function( p0, p1 ) {
        var left, bottom, right, top;
        
        if (p0[0] < p1[0]) {
            left = p0[0]; right = p1[0];
        } else {
            left = p1[0]; right = p0[0];
        }
        if (p0[1] < p1[1]) { 
            bottom = p0[1]; top = p1[1]; 
        } else {
            bottom = p1[1]; top = p0[1]; 
        }

        return {
            x0: left,  y0: bottom, 
            x1: right, y1: top };
    },

    interects: function( player ) {
        return rectsIntersect( this.boundingBox(), player.boundingBox() );
    },

    hitsWall: function( player ) {

        var wall = player.wall;

        for (var i = 0; i < wall.length-2; i++) {
            if (rectsIntersect( this.boundingBox(),
                                this.wallBox( wall[i], wall[i+1] )))
            {
                return true;
            }
        }

        // finally check last two segments from player to last wall vertex,
        // unless it is our wall
        if (this != player) {
            if (wall.length == 1) {     // check only last segment to player
                return rectsIntersect( this.boundingBox(),
                                       this.wallBox( wall[i], player.pos ));
            } else {
                // check last two vertices of wall
                return rectsIntersect( this.boundingBox(),
                                       this.wallBox( wall[i], wall[i+1] )) ||
                    rectsIntersect( this.boundingBox(),
                                    this.wallBox( wall[i+1], player.pos ));
            }
 
        }
        return false;
    }

});

function rectsIntersect( r1, r2 ) {
    return ! (   r2.x0 > r1.x1
              || r2.x1 < r1.x0
              || r2.y0 > r1.y1
              || r2.y1 < r1.y0 );
}

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

