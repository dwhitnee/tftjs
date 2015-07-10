package main

import "fmt"
//import "os"

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 * ---
 * Hint: You can use the debug stream to print initialTX and initialTY, if Thor seems not follow your orders.
 **/

func main() {
    // lightX: the X position of the light of power
    // lightY: the Y position of the light of power
    // initialTX: Thor's starting X position
    // initialTY: Thor's starting Y position
    var lightX, lightY, initialTX, initialTY int
    fmt.Scan(&lightX, &lightY, &initialTX, &initialTY)
    
    var x = initialTX;
    var y = initialTY;

    for {
      var dx = lightX - x;
      var dy = y - lightY;
      var dir = "";
      
      if (dy > 0) {  dir  = "N"; y -= 1; }
      if (dy < 0) {  dir  = "S"; y += 1; }
      if (dx > 0) {  dir += "E"; x += 1; }
      if (dx < 0) {  dir += "W"; x -= 1; }
             
      fmt.Println( dir ) // A single line providing the move to be made: N NE E SE S SW W or NW
    }
}