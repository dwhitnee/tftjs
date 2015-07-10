/**
 * Horse Duals - codingame.com
 * 
 * 2015, dwhitnee@gmail.com - David Whitney
 **/

var horses = [];

var N = parseInt(readline());
for (var i = 0; i < N; i++) {
  var Pi = parseInt(readline());
  horses.push( 0 + Pi );  
}

horses.sort(function(a,b) { return a - b; });

var bestPowerDiff = 1000000;

for (i=1; i < horses.length; i++) {
  var diff = Math.abs( horses[i-1] - horses[i] );
  if (diff < bestPowerDiff) {
    bestPowerDiff = diff;
  }
}

print( bestPowerDiff );
