p = readline().split(' ');
LX = p[0]|0; // the X position of the light of power
LY = p[1]|0; // the Y position of the light of power
x = p[2]|0; // Thor's starting X position
y = p[3]|0; // Thor's starting Y position

// game loop
while (true) {
  dir = "";

  if (y - LY > 0) {  dir  = "N"; y--; }
  if (y - LY < 0) {  dir  = "S"; y++; }
  if (LX - x > 0) {  dir += "E"; x++; }
  if (LX - x < 0) {  dir += "W"; x--; }
  print( dir );
}