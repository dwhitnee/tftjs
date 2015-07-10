# lightX: the X position of the light of power
# lightY: the Y position of the light of power
# initialTX: Thor's starting X position
# initialTY: Thor's starting Y position
read lightX lightY initialTX initialTY

x=$initialTX;
y=$initialTY;

# game loop
while true; do

    dx=$((lightX-$x));
    dy=$((y-$lightY));
    dir="";

    if [ "$dy" -gt 0 ]; then
        dir="N"; y=$((y-1));
    fi
    if [ "$dy" -lt 0 ]; then
        dir="S"; y=$((y+1));
    fi
    if [ "$dx" -gt 0 ]; then
        dir=$dir"E"; x=$((x+1));
    fi
    if [ "$dx" -lt 0 ]; then
        dir=$dir"W"; x=$((x-1));
    fi

    echo $dir
done