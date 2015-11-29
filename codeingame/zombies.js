/**
 * Codingame.com "Code vs Zombies"
 * Move "Ash" around to kill zombies before they eat humans.
 *
 * Save humans, destroy zombies!
 *
 * Each turn, Ash will move at most 1000 units towards the target coordinate.
 * If at the end of a turn, a zombie is within 2000 units of Ash,
 * he will shoot that zombie and destroy it.

 * Other humans will be present in the game zone, but will not move.
 * If zombies kill all of them, you lose.

 * Zombies work as follows:
 * Each turn, every zombie will target the closest human, including
 * Ash, and step 400 units towards them. If the zombie is less than
 * 400 units away, the human is killed and the zombie moves onto their coordinate
 *
 * Strategy:
 * * save nearest human: 100%, 30,000
 * * save nearest human first, then go after zombies: 47,430
 *
 *
 * 2015, David Whitney
 **/

var me = {};
var humans, zombies;
var i, inputs, message;

var ashSpeed = 1000;
var ashKillRadius = 2000;
var zombieSpeed = 400;
var zombieKillRadius = 400;

var humanSaved = false;

function distance( a, b ) {
  printErr( JSON.stringify( a ) + " to " + JSON.stringify( b ));

  return Math.sqrt( Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2));
}

/**
 * find geomteric center of a set of zombies
 */
function centriod( pts ) {
  var centroid = {};

  var signedArea = 0.0;
  var x0 = 0.0; // Current vertex X
  var y0 = 0.0; // Current vertex Y
  var x1 = 0.0; // Next vertex X
  var y1 = 0.0; // Next vertex Y
  var a = 0.0;  // Partial signed area

  // For all vertices
  var numPts = pts.length;

  for (var i=0; i < numPts-1; ++i) {
    x0 = pts[i].x;
    y0 = pts[i].y;
    x1 = pts[(i+1) % numPts].x;
    y1 = pts[(i+1) % numPts].y;
    a = x0*y1 - x1*y0;
    signedArea += a;
    centroid.x += (x0 + x1)*a;
    centroid.y += (y0 + y1)*a;
  }

  signedArea *= 0.5;
  centroid.x /= (6.0*signedArea);
  centroid.y /= (6.0*signedArea);

  return centroid;
}

/**
 * Dumb alg to make a beeline for the nearest zombie.
 * Should really go to the nearest human in danger.
 */
function findNearestZombie( me ) {
  var zombie = undefined;
  var bestDistance = 100000;

  for (var i = 0; i < zombies.length; i++) {
    if (!zombies[i]) {  // this zombie is dead already..
      continue;
    }
    var zombieDistance = distance( me, zombies[i]);
    if (zombieDistance < bestDistance) {
      zombie = zombies[i];
      bestDistance = zombieDistance;
    }
  }

  if (zombie) {
    print( zombie.x + " " + zombie.y + " " + message);
  } else {
    print("0 0 Doh!");
  }
}

/**
 * @return [boolean] can we get to this human from (x,y) before a zombie gets it?
 */
function isHumanSavable( human, me ) {
  var turnsToSaveHuman = Math.ceil(
    (distance(me, human) - ashKillRadius) / ashSpeed );

  for (var i = 0; i < zombies.length; i++) {
    if (!zombies[i]) {  // this zombie is dead already..
      continue;
    }
    var turnsBeforeZombieKillsHuman = Math.ceil(
      (distance( zombies[i], human) - zombieKillRadius) / zombieSpeed );

    if (turnsBeforeZombieKillsHuman < turnsToSaveHuman) {
      return false;  // alas...
    }
  }
  return true;   // we can make it in time!
}

/**
 * This works by guarnteeing one saved human.
 * TBD: lure zombies away from safe humans.
 */
function findNearestSavableHuman( me ) {
  var human = undefined;
  var bestDistance = 100000;

  for (var i = 0; i < humans.length; i++) {
    if (!humans[i]) {  // this human is dead already..
      continue;
    }
    var humanDistance = distance( me, humans[i]);
    if (humanDistance < bestDistance) {
      if (isHumanSavable( humans[i], me )) {
        human = humans[i];
        bestDistance = humanDistance;
      }
    }
  }

  if (bestDistance < ashKillRadius) {
    humanSaved = true;
  }

  if (human) {
    print( human.x + " " + human.y + " " + message);
  } else {
    print("0 0 Doh!");
  }
}

var numZombies = 1000;

while (true) {
  inputs = readline().split(' ');
  me.x = parseInt(inputs[0]);   //  x [0, 16000)
  me.y = parseInt(inputs[1]);    // y [0, 9000)

  humans = [];
  var humanCount = parseInt(readline());   // < 100
  for (i = 0; i < humanCount; i++) {
    inputs = readline().split(' ');
    humans.push({
                  id: parseInt(inputs[0]),
                  x: parseInt(inputs[1]),
                  y: parseInt(inputs[2])
                });
  }

  var zombieCount = parseInt(readline());   // < 100

  // enter search mode if a zombie died
  message = "";
  if (numZombies != zombieCount) {
    message = "Die!";
    numZombies = zombieCount;
  }

  zombies = [];
  for (i = 0; i < zombieCount; i++) {
    inputs = readline().split(' ');
    var zombieId = parseInt(inputs[0]);
    zombies.push({
      x: parseInt(inputs[1]),
      y: parseInt(inputs[2]),
      nextX: parseInt(inputs[3]),  // where zombie is headed (human)
      nextY: parseInt(inputs[4])
    });
  }

  if (!humanSaved) {
    findNearestSavableHuman( me );  // stand your ground!
  } else {
    findNearestZombie( me );
  }

  // should find center mass of zombies, not nearest zombie
  // zombies within 2000 radius of ne
  //
  // unlessMovingAwayWouldKillLastHumanFindNearestZombie
}
