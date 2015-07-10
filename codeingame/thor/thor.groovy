input = new Scanner(System.in);

lightX = input.nextInt() // the X position of the light of power
lightY = input.nextInt() // the Y position of the light of power
initialTX = input.nextInt() // Thor's starting X position
initialTY = input.nextInt() // Thor's starting Y position

x = initialTX;
y = initialTY;

// game loop
while (true) {

      dx = lightX - x;
      dy = y - lightY;
      dir = "";

      if (dy > 0) {  dir  = "N"; y -= 1; }
      if (dy < 0) {  dir  = "S"; y += 1; }
      if (dx > 0) {  dir += "E"; x += 1; }
      if (dx < 0) {  dir += "W"; x -= 1; }

     println dir
}
