/**
 * Stock Exchange minimize losses
 * Codingame.com
 * 2015, dwhitnee@gmail.com - David Whitney
 **/

/*
function printErr( x ) {
  console.log( x );
}
function print( x ) {
  console.log( x );
}
var n = 6;
var data = "3 2 10 7 15 14";
*/

var n = parseInt(readline());
var data = readline();

var prices = data.split(" ").map(Number);

var lowestPrice,lowestPriceIndex = -1;

// get lowest price in array starting at 'start', cache it for next time.
function getNextLowestPrice( start ) {
  if (start <= lowestPriceIndex) {
    return lowestPrice;
  }

  lowestPrice = 100000000000000;
  lowestPriceIndex = -1;

  for (var i = start; i < prices.length; i++) {
    if (prices[i] < lowestPrice) {
      lowestPriceIndex = i;
      lowestPrice = prices[i];
    }
  } 
  return lowestPrice;
}

var maxLoss = 0;

for (var b = 0; b < prices.length-1; b++) {
  var nextLowestPrice = getNextLowestPrice( b+1 );

//  printErr( b + " " + prices[b] + " " + nextLowestPrice );

  var loss = nextLowestPrice - prices[b];
  if (loss < maxLoss) {
    maxLoss = loss;
  }   
}

print( maxLoss );
