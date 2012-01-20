// http://www.whatwg.org/specs/web-apps/current-work/#canvasrenderingcontext2d

var sun = {
    name: "Sun",
    size: 200,
        text: {
        text: "Sun",
        x: 100,
        y: 100
    }
};

var earth = {
    name: "Earth",
    text: {
        text: "Earth",
        x: 50,
        y: 50
    },
    orbit: 250,
    size: 100
};

var moon  = {
    name: "Moon",
    text: {
        text: "Moon",
        x: 20,
        y: 20
    },
    orbit: 80,
    size: 20
};


var gl, canvas;
var scene;
var time;
var x, y, scale;
var earthquake = false;

//----------------------------------------
function toggleEarthquake() {
    earthquake = !earthquake;
    if (earthquake) {
	$("#message").text("EARTHQUAKE!!!!");
    } else {
	$("#message").text("");
    }
}

//----------------------------------------
function trackClick( e ) {
    alert("click");
}

//----------------------------------------
// Clicks
//----------------------------------------
function initHandlers() {

    // zoom, keys don't work in FF3?
    $("#canvas").keypress(
        function( e ) {
            alert("key");
            debugger;
        }
    );

    // drag
    $("#canvas").mousedown(
        function ( e ) {
            var xStart = e.pageX;
            var yStart = e.pageY;

            var x0 = x;
            var y0 = y;

            $("#canvas").mousemove(
                function ( e ) {
                    x = x0 + (e.pageX - xStart);
                    y = y0 + (e.pageY - yStart);
                }
            );
            // end drag on mouseup or mouse leaving the canvas
            $("body").mouseup(
                function ( e ) {
                    $("#canvas").unbind('mousemove');
                });
            $("#canvas").mouseleave(
                function ( e ) {
                    $("#canvas").unbind('mousemove');
                });

        });

    $("#earthquake_btn").click( toggleEarthquake );
    $("#play_btn").click( toggleDraw );
    $("#zoom_in_btn").click(  function() { scale /= .9; draw(); }  );
    $("#zoom_out_btn").click( function() { scale *= .9; draw(); }  );
}


//----------------------------------------------------------------------
function init(){

    initHandlers();

    // var bob = "http://img.thesun.co.uk/multimedia/archive/00626/SNF24BIZ5_280_626560a.jpg";
    // var bob = "http://s3.hubimg.com/u/44230_f260.jpg";
    var bob = "bob-med.png";
    var blueMarble = "earth.jpg";

    // var blueMarble = "http://daddysdown.com/wp-content/uploads/2011/04/earth.gif";
    // var blueMarble = "http://darwinbusters.com/images/008-earth-from-space-africa.jpg";
    // http://www.uiowa.edu/~nathist/images/earth_001.png

    sun.image  = new Gfx.Image( bob );
    moon.image = new Gfx.Image(  bob );
    earth.image = new Gfx.Image( blueMarble );

    // not sure how far to go wrapping canvas and Context2D ...
    // just to avoid passing gl around.
    canvas = new Gfx.Canvas( $('#canvas')[0] );

    gl = canvas.gl;

    // gl.globalCompositeOperation = 'destination-over';
    gl.globalCompositeOperation = 'source-over';

    x = 0;
    y = 0;
    scale = 1;

    scene = buildScene();

    toggleDraw();
}


//----------------------------------------------------------------------
function toggleDraw() {

    if (Gfx.Animation.isRunning()) {

        Gfx.Animation.stop();
        $("#play_btn").text("Start");

    } else {

        Gfx.Animation.start( draw );
        $("#play_btn").text("Stop");

    }
}


//----------------------------------------------------------------------
function buildScene() {

    var scene = new Gfx.Group( { name: "Scene" } );

    var viewXform  = new Gfx.Transform( view );
    var earthXform = new Gfx.Transform( earth );
    var moonXform  = new Gfx.Transform( moon );

    scene.add( viewXform );

    viewXform.add( new Gfx.Geode( sun ));
    viewXform.add( new Gfx.TextNode( sun.text ));
    viewXform.add( new Gfx.Geode( earth.orbitalPath ));
    viewXform.add( earthXform );

    //earthXform.add(  new Gfx.Geode( earth ));
    var earthRotation = new Gfx.Transform( earth.rotation );
    earthXform.add(  earthRotation );
    earthRotation.add( new Gfx.Geode( earth ));
    earthRotation.add(  new Gfx.TextNode( earth.text ));

    earthXform.add( moonXform );

    moonXform.add(  new Gfx.Geode( moon ));
    moonXform.add(  new Gfx.TextNode( moon.text ));

    return scene;
}


//----------------------------------------
function draw() {

    Gfx.Animation.frameStart();

    if (earthquake) {
        var jitter = 8;
	x += Math.random() * jitter - jitter/2;
	y += Math.random() * jitter - jitter/2;
    }

    time = new Date();

    // canvas.clearWithFade( 0.50 );
    canvas.clear();

    scene.traverse( gl );

    // drawSceneManually( gl );

    $("#fps").text("fps=" + Gfx.Animation.fps + ",  delay=" +
                   Gfx.Animation.framePause + "ms, c = " +
                   Gfx.Animation.frameCount );

    Gfx.Animation.frameDone();
}


// obsolete
function drawSceneManually( gl ) {
    gl.save();

    view.transform( gl );
    sun.draw( gl );
    earth.orbitalPath.draw( gl );
    earth.transform( gl );
    earth.draw( gl );
    moon.transform( gl );
    moon.draw( gl );

    gl.restore();
}




//----------------------------------------------------------------------
//    Geometry data
//----------------------------------------------------------------------


//----------------------------------------------------------------------
// camera view
//----------------------------------------------------------------------
var view = {
    // position universe
    name: "Universe View",
    transform: function( gl ) {
        gl.translate( 400 + x, 300 + y );
        gl.scale( scale, scale );
    }
};

//----------------------------------------------------------------------
//  Sun
//----------------------------------------------------------------------
sun.draw = function ( gl ) {

    this.image.drawCentered( gl, this.size );

};

//----------------------------------------------------------------------
//  Earth
//----------------------------------------------------------------------
earth.draw = function( gl ) {

    this.image.drawCentered( gl, this.size );

};

earth.transform = function( gl ) {

    // where around sun are we? move around orbit

    gl.rotate( ( (2*Math.PI)/60) * time.getSeconds() +
	       ( (2*Math.PI)/60000) * time.getMilliseconds() );

    gl.translate( this.orbit, 0);

};

earth.rotation = {
    name: "Earth rotation",
    transform: function( gl ) {

        gl.rotate( -6*(((2*Math.PI)/60) * time.getSeconds() +
	             ((2*Math.PI)/60000) * time.getMilliseconds() ));

    }
};

earth.orbitalPath = {
    name: "orbital path",
    draw: function( gl ) {
        gl.save();

        gl.fillStyle   = 'rgba(0,  0,  0, 0.2)';
        gl.strokeStyle = 'rgba(0,153,255, 0.2)';

        // orbit
        gl.beginPath();
        gl.arc( 0, 0, earth.orbit, 0, Math.PI*2, false);   // Earth orbit
        gl.stroke();

        gl.restore();  // pop blue
    }
};




//----------------------------------------------------------------------
//  Moon
//----------------------------------------------------------------------
moon.transform = function() {

    gl.rotate( ((2*Math.PI)/6)*time.getSeconds() +
	        ((2*Math.PI)/6000)*time.getMilliseconds() );

    // move into orbit
    gl.translate( this.orbit, 0 );

    // rotate bob moon to face sun
    gl.rotate( -(((2*Math.PI)/6)*time.getSeconds() +
	         ((2*Math.PI)/6000)*time.getMilliseconds() ));

    // point head first
    gl.rotate( Math.PI / 2);
};

moon.draw = function() {

    this.image.drawCentered( gl, this.size );
};
