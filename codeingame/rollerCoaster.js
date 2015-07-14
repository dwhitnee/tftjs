/**
 * Roller Coaster earnings
 * Codeingame
 * 
 * 2015, David Whitney (dwhitnee)
 */

var inputs = readline().split(' ');
var SeatsPerRide = parseInt(inputs[0]);
var ridesLeft = parseInt(inputs[1]);
var numGroups = parseInt(inputs[2]);

var groupSizes = [];
for (var i = 0; i < numGroups; i++) {
  var groupSize = parseInt(readline());
  groupSizes.push( groupSize );
}

printErr( groupSizes );

var revenue = 0;
var capacity = SeatsPerRide;

while (ridesLeft) {
  var firstRide = true;

  for (i = 0; i < groupSizes.length; i++) {
    var nextGroup = groupSizes[i];

    printErr("ridesLeft: " + ridesLeft );
    printErr("seatsPerRide: " + SeatsPerRide );
    printErr("nextGroup size : " + nextGroup);
    printErr("---");

    if (ridesLeft === 0)  // day's over
      break;
    
    if (nextGroup <= capacity) {    // group is small enough to get on
      revenue += nextGroup;
      capacity -= nextGroup;

    } else {
      capacity = 0;
      i--;  // try these guys next ride
    }

    if (capacity === 0) {  // send ride off and reset
      ridesLeft--;
      capacity = SeatsPerRide;
      firstRide = false;
    }
  }
  
  if (firstRide) {  // the whole line is on the ride at once
    ridesLeft--;
    capacity = SeatsPerRide;
  }
}
 
print( revenue );