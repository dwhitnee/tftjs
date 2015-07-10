#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * You can use the debug stream to print initialTX and initialTY, if Thor seems not follow your orders.
 **/
int main()
{
    int LX; // the X position of the light of power
    int LY; // the Y position of the light of power
    int initialTX; // Thor's starting X position
    int initialTY; // Thor's starting Y position
    cin >> LX >> LY >> initialTX >> initialTY; cin.ignore();

    int x = initialTX;
    int y = initialTY;

    // game loop
    while (1) {
        int dx = LX - x;
        int dy = y - LY;
        string dir = "";

        if (dy > 0) {  dir  = "N"; y -= 1; }
        if (dy < 0) {  dir  = "S"; y += 1; }
        if (dx > 0) {  dir += "E"; x += 1; }
        if (dx < 0) {  dir += "W"; x -= 1; }

        cout << dir << endl;
    }
}
