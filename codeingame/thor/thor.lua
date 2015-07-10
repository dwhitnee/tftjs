-- lightX: the X position of the light of power
-- lightY: the Y position of the light of power
-- initialTX: Thor's starting X position
-- initialTY: Thor's starting Y position
next_token = string.gmatch(io.read(), "[^%s]+")
lightX = tonumber(next_token())
lightY = tonumber(next_token())
initialTX = tonumber(next_token())
initialTY = tonumber(next_token())

x = initialTX;
y = initialTY;

-- game loop
while true do

      dx = lightX - x;
      dy = y - lightY;
      dir = "";

      if (dy > 0) then
         dir  = "N"
         y = y - 1
      end
      if (dy < 0) then
        dir  = "S"
        y = y + 1;
      end
      if (dx > 0) then
        dir = dir .. "E"
        x = x + 1;
      end
      if (dx < 0) then
        dir = dir .. "W";
        x = x - 1;
      end

    print( dir )
end
