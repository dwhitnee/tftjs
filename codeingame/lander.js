/**
 * Lnar Lander.  Reach landing zone with < delta (20,40) m/s
 */

var g = 3.711; // m/s²
var landing = {
  hMax: 20,  // m/s for landing
  vMax: 40   // m/s downward
};

var surfaceN = parseInt(readline()); // the number of points used to draw the surface of Mars.

var x0 = -1, y0 = -1;
for (var i = 0; i < surfaceN; i++) {
  var inputs = readline().split(' ');
  var x = parseInt(inputs[0]); // X coordinate of a surface point. (0 to 6999)
  var y = parseInt(inputs[1]); // Y coordinate of a surface point. By linking all the points together in a sequential fashion, you form the surface of Mars.
  printErr( x + " " + y);
  
  if (y === y0) {  // we found level ground (What about multiple landing sites?)
    landing.zone = {
      xL: x0 + (x-x0)*.20,
      xR: x -  (x-x0)*.20,
      y: y,
      xCenter: (x0+x)/2    // aim here!
    };
  }
  x0 = x;
  y0 = y;
}

printErr( JSON.stringify( landing ));

var thrust = 0;
var angle = 0;

// game loop
while (true) {
  var inputs = readline().split(' ');
  var x = parseInt(inputs[0]);
  var y = parseInt(inputs[1]);
  var dx = parseInt(inputs[2]);   // the horizontal speed (in m/s), can be negative.
  var dy = -parseInt(inputs[3]);  // the vertical speed *downward* (in m/s)
  var fuel = parseInt(inputs[4]); // the quantity of remaining fuel in liters.
  var rotate = parseInt(inputs[5]); // the rotation angle in degrees (-90 to 90).
  var power = parseInt(inputs[6]);  // the thrust power (0 to 4).
  
  // We are at X,Y with dx,dy speed.  Reach LZ x,y with dx,dy < max
  // future pos with no action:
  var x1 = x + dx;
  var y1 = y + dy;

  // don't fire retros until last possible second, but it takes 4
  // seconds to get to max thrust

  // v = d / t
  // t = d / v

  var distanceToImpact = y - landing.zone.y;
  var secondsToImpact = 15;
  if (dy) {
      secondsToImpact = Math.min( 20, Math.abs(distanceToImpact/dy));  // urgency
  }
  
  var retroDY = 4 - g;  // max thrust - gravity = ~.3m/s   

  printErr("dX: " +  dx );
  printErr("dY: " +  dy );
  printErr("Seconds to impact: " + secondsToImpact );

  // fire at last possible second (but add ~3s for reaction time)
  // doesn't work if we are already too low
  var overSpeed = dy - landing.vMax;
  if (overSpeed > (secondsToImpact-4) * retroDY) {
    thrust = 4;
  } else {
    thrust = 3;
  }

  var baseAngle = 30;
  var hoverMode = false;  // low to the ground we go into zero dx (hover) mode to skim the surface.

  if ((distanceToImpact < 600)) {
    baseAngle = 20;   // need to keep us hovering if we're too close, but far away
    hoverMode = true;
  }

  function moveRight() {
    angle = -baseAngle;
    thrust = 4;
  }

  function moveLeft() {
    angle = baseAngle;
    thrust = 4;
  }

  function levelOff() {
    angle = 0;
  }

  levelOff();

  // Don't be so aggressive about getting to landing zone 
  // (and overshooting) if we are hovering
  if (hoverMode) {
    secondsToImpact *= 1.5;
  }

  // if X is outside landing zone and dX will not get us there (+10% fudge) then fire
  if ((x+(secondsToImpact*1.1)*dx) < landing.zone.xL) {
    moveRight();
    printErr("right");    
  } else if ((x+(secondsToImpact*1.1)*dx) > landing.zone.xR) {
    moveLeft();
    printErr("left");    
    
  } else if (Math.abs(dx) > landing.hMax) {    // straighten out
    if (dx > 0) { // moving right too fast
      moveLeft();
      printErr("left retro");    
    } else {
      moveRight();
      printErr("right retro");    
    }
    
  } else if ((x < landing.zone.xR) &&     // we're in the zone, but
             (x > landing.zone.xL) &&
             (Math.abs(dx) > landing.hMax/1.5) &&  // drifting a little too fast
             secondsToImpact > 5)   // don't futz on final approach
  {     // straighten out
    if (dx > 0) { // moving right too fast
      moveLeft();
      printErr("left fine tune");    
    } else {
      moveRight();
      printErr("right fine tune");    
    }
  }
  
  // brace for impact!
  if (secondsToImpact < 4) {
    levelOff();
    thrust = 4;   
  }

  print( angle + " " + thrust);
}
