#include <Foundation/Foundation.h>

int main(int argc, const char * argv[]) {
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

        printf("%s%s\n", dir1, dir2);
    }
}
