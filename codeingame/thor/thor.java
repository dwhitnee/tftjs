import java.util.*;
import java.io.*;
import java.math.*;

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 * ---
 * Hint: You can use the debug stream to print initialTX and initialTY, if Thor seems not follow your orders.
 **/
class Player {

    public static void main(String args[]) {
        Scanner in = new Scanner(System.in);
        int LX = in.nextInt(); // the X position of the light of power
        int LY = in.nextInt(); // the Y position of the light of power
        int initialTX = in.nextInt(); // Thor's starting X position
        int initialTY = in.nextInt(); // Thor's starting Y position

        int x = initialTX;
        int y = initialTY;

        // game loop
        while (true) {

            int dx = LX - x;
            int dy = y - LY;
            String dir = "";

            if (dy > 0) {  dir  = "N"; y -= 1; }
            if (dy < 0) {  dir  = "S"; y += 1; }
            if (dx > 0) {  dir += "E"; x += 1; }
            if (dx < 0) {  dir += "W"; x -= 1; }

            System.out.println( dir ); // A single line providing the move to be made: N NE E SE S SW W or NW
        }
    }
}