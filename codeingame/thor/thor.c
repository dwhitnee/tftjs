#include <stdlib.h>
#include <stdio.h>
#include <string.h>

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 * ---
 * Hint: You can use the debug stream to print initialTX and initialTY, if Thor seems not follow your orders.
 **/
int main()
{
    int LX; // the X position of the light of power
    int LY; // the Y position of the light of power
    int initialTX; // Thor's starting X position
    int initialTY; // Thor's starting Y position
    scanf("%d%d%d%d", &LX, &LY, &initialTX, &initialTY);

    int x = initialTX;
    int y = initialTY;

    // game loop
    while (1) {
        int dx = LX - x;
        int dy = y - LY;
        char* dir1 = "";
        char* dir2 = "";

        if (dy > 0) { dir1 = "N"; y -= 1; }
        if (dy < 0) { dir1 = "S"; y += 1; }
        if (dx > 0) { dir2 = "E"; x += 1; }
        if (dx < 0) { dir2 = "W"; x -= 1; }

        // Write an action using printf(). DON'T FORGET THE TRAILING \n
        // To debug: fprintf(stderr, "Debug messages...\n");

        printf("%s%s\n", dir1, dir2); // A single line providing the move to be made: N NE E SE S SW W or NW
    }
}
