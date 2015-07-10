STDOUT.sync = true # DO NOT REMOVE
# Auto-generated code below aims at helping you parse
# the standard input according to the problem statement.
# ---
# Hint: You can use the debug stream to print initialTX and initialTY, if Thor seems not follow your orders.

# lightX: the X position of the light of power
# lightY: the Y position of the light of power
# initialTX: Thor's starting X position
# initialTY: Thor's starting Y position
$lightX, $lightY, $initialTX, $initialTY = gets.split(" ").collect {|x| x.to_i}

x = $initialTX
y = $initialTY

# game loop
loop do
    dx = $lightX - x
    dy = y - $lightY
    dir = ""

    # Write an action using puts
    # To debug: STDERR.puts "Debug messages..."

    if dy > 0
        dir  = "N";
        y -= 1;
    end

    if dy < 0
        dir  = "S";
        y += 1
    end

    if dx > 0
        dir += "E"; x += 1
    end

    if dx < 0
        dir += "W"; x -= 1
    end
    #STDERR.puts "#{x}, #{y}   delta: #{dx}, #{dy} #{dir}"
    puts dir # A single line providing the move to be made: N NE E SE S SW W or NW
end
