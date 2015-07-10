select(STDOUT); $| = 1; # DO NOT REMOVE

# Auto-generated code below aims at helping you parse
# the standard input according to the problem statement.
# ---
# Hint: You can use the debug stream to print initialTX and initialTY, if Thor seems not follow your orders.

# lightX: the X position of the light of power
# lightY: the Y position of the light of power
# initialTX: Thors starting X position
# initialTY: Thors starting Y position
chomp($tokens=<STDIN>);
($LX, $LY, $initialTX, $initialTY) = split(/ /,$tokens);

$x = $initialTX;
$y = $initialTY;

# game loop
while (1) {
    $dx = $LX - $x;
    $dy = $y - $LY;
    $dir = "";

    if ($dy > 0) { $dir = "N"; $y -= 1; }
    if ($dy < 0) { $dir = "S"; $y += 1; }
    if ($dx > 0) { $dir = $dir . "E"; $x += 1; }
    if ($dx < 0) { $dir = $dir . "W"; $x -= 1; }

    print $dir . "\n";
}
