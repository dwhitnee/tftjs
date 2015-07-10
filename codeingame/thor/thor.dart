import 'dart:io';
import 'dart:math';

void main() {
    List inputs;
    inputs = stdin.readLineSync().split(' ');
    int LX = int.parse(inputs[0]); // the X position of the light of power
    int LY = int.parse(inputs[1]); // the Y position of the light of power
    int initialTX = int.parse(inputs[2]); // Thor's starting X position
    int initialTY = int.parse(inputs[3]); // Thor's starting Y position

    int x = initialTX;
    int y = initialTY;

    // game loop
    while (true) {
        int dx = LX - x;
        int dy = y - LY;
        var dir = "";

        if (dy > 0) {  dir  = "N"; y -= 1; }
        if (dy < 0) {  dir  = "S"; y += 1; }
        if (dx > 0) {  dir += "E"; x += 1; }
        if (dx < 0) {  dir += "W"; x -= 1; }

        print( dir );
    }
}
