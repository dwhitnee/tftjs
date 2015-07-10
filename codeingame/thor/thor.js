/**
 *  Hint: You can use the debug stream to print TX and TY, if Thor does not follow your orders.
 **/

var inputs = readline().split(' ');
var LX = parseInt(inputs[0]); // the X position of the light of power
var LY = parseInt(inputs[1]); // the Y position of the light of power
var TX = parseInt(inputs[2]); // Thor's starting X position
var TY = parseInt(inputs[3]); // Thor's starting Y position

var x = TX;
var y = TY;

// game loop
while (true) {
  var dx = LX - x;
  var dy = y - LY;
  var dir = "";

  if (dy > 0) {  dir  = "N"; y -= 1; }
  if (dy < 0) {  dir  = "S"; y += 1; }
  if (dx > 0) {  dir += "E"; x += 1; }
  if (dx < 0) {  dir += "W"; x -= 1; }
  print( dir );
}
