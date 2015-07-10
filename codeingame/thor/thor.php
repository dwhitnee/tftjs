<?php
/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 * ---
 * Hint: You can use the debug stream to print initialTX and initialTY, if Thor seems not follow your orders.
 **/

fscanf(STDIN, "%d %d %d %d",
    $lightX, // the X position of the light of power
    $lightY, // the Y position of the light of power
    $initialTX, // Thor's starting X position
    $initialTY // Thor's starting Y position
);

$x = $initialTX;
$y = $initialTY;

// game loop
while (TRUE)
{

    $dx = $lightX - $x;
    $dy = $y - $lightY;
    $dir = "";

    if ($dy > 0) { $dir = "N"; $y -= 1; }
    if ($dy < 0) { $dir = "S"; $y += 1; }
    if ($dx > 0) { $dir = $dir . "E"; $x += 1; }
    if ($dx < 0) { $dir = $dir . "W"; $x -= 1; }

    // Write an action using echo(). DON'T FORGET THE TRAILING \n
    // To debug (equivalent to var_dump): error_log(var_export($var, true));

    echo($dir . "\n"); // A single line providing the move to be made: N NE E SE S SW W or NW
}
?>
