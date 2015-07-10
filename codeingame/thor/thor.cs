using System;
using System.Linq;
using System.IO;
using System.Text;
using System.Collections;
using System.Collections.Generic;

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 * ---
 * Hint: You can use the debug stream to print initialTX and initialTY, if Thor seems not follow your orders.
 **/
class Player
{
    static void Main(string[] args)
    {
        string[] inputs = Console.ReadLine().Split(' ');
        int LX = int.Parse(inputs[0]); // the X position of the light of power
        int LY = int.Parse(inputs[1]); // the Y position of the light of power
        int initialTX = int.Parse(inputs[2]); // Thor's starting X position
        int initialTY = int.Parse(inputs[3]); // Thor's starting Y position

        int x = initialTX;
        int y = initialTY;

        // game loop
        while (true)
        {
            int dx = LX - x;
            int dy = y - LY;
            string dir = "";

            if (dy > 0) {  dir  = "N"; y -= 1; }
            if (dy < 0) {  dir  = "S"; y += 1; }
            if (dx > 0) {  dir += "E"; x += 1; }
            if (dx < 0) {  dir += "W"; x -= 1; }

            Console.WriteLine( dir ); // A single line providing the move to be made: N NE E SE S SW W or NW
        }
    }
}
