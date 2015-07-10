program Answer;
{$H+}
uses sysutils, classes, math;

// Helper to read a line and split tokens
procedure ParseIn(Inputs: TStrings) ;
var Line : string;
begin
    readln(Line);
    Inputs.Clear;
    Inputs.Delimiter := ' ';
    Inputs.DelimitedText := Line;
end;

var
   LX        : Int32; // the X position of the light of power
   LY        : Int32; // the Y position of the light of power
   initialTX : Int32; // Thors starting X position
   initialTY : Int32; // Thors starting Y position
   Inputs    : TStringList;
   x         : Int32;
   y         : Int32;
   dx        : Int32;
   dy        : Int32;
   dir       : String;

begin
   Inputs := TStringList.Create;
   ParseIn(Inputs);
   LX := StrToInt(Inputs[0]);
   LY := StrToInt(Inputs[1]);
   initialTX := StrToInt(Inputs[2]);
   initialTY := StrToInt(Inputs[3]);

   x := initialTX;
   y := initialTY;

   // game loop
   while true do
   begin
      dx := LX - x;
      dy := y - LY;
      dir := '';

      if (dy > 0) then
      begin
         dir := 'N'; y := y - 1;
      end;

      if (dy < 0) then
      begin
         dir := 'S'; y := y + 1;
      end;

      if (dx > 0) then
      begin
         dir := dir + 'E'; x := x + 1;
      end;

      if (dx < 0) then
      begin
         dir := dir + 'W'; x := x - 1;
      end;

      writeln( dir );
      flush(StdErr); flush(output); // DO NOT REMOVE
   end;
end.