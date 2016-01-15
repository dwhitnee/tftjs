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
 * o save nearest savable human: 100%, 30,000
 * o save nearest human first, then go after zombies: 47,430
 * o save nearest human, then find center of zombie mass, unless zombies are
 *   too far away (flanking risk) 43,240
 * o save nearest human, then find center of zombie mass, unless zombies are
 *   spead out too much (flanking risk) 38,890
 *
 * 2015, David Whitney
 **/



//----------------------------------------------------------------------
//----------------------------------------------------------------------
/**
 * Graham's Scan Convex Hull Algorithm
 * @desc An implementation of the Graham's Scan Convex Hull algorithm in Javascript.
 * @author Brian Barnett, brian@3kb.co.uk, http://brianbar.net/ || http://3kb.co.uk/
 * @version 1.0.2

 * https://github.com/brian3kb/graham_scan_js
 */
function ConvexHullGrahamScan() {
    this.anchorPoint = undefined;
    this.reverse = false;
    this.points = [];
}

ConvexHullGrahamScan.prototype = {

    constructor: ConvexHullGrahamScan,

    Point: function (x, y) {
        this.x = x;
        this.y = y;
    },

    _findPolarAngle: function (a, b) {
        var ONE_RADIAN = 57.295779513082;
        var deltaX = (b.x - a.x);
        var deltaY = (b.y - a.y);

        if (deltaX == 0 && deltaY == 0) {
            return 0;
        }

        var angle = Math.atan2(deltaY, deltaX) * ONE_RADIAN;

        if (this.reverse){
            if (angle <= 0) {
                angle += 360;
            }
        }else{
            if (angle >= 0) {
                angle += 360;
            }
        }

        return angle;
    },

    addPoint: function (x, y) {
        //Check to see if anchorPoint has been defined yet.
        if (this.anchorPoint === undefined) {
            //Create new anchorPoint.
            this.anchorPoint = new this.Point(x, y);

            // Sets anchorPoint if point being added is further left.
        } else if (this.anchorPoint.y > y || (this.anchorPoint.y == y && this.anchorPoint.x > x)) {
            this.anchorPoint.y = y;
            this.anchorPoint.x = x;
            this.points.unshift(new this.Point(x, y));
            return;
        }

        this.points.push(new this.Point(x, y));
    },

    _sortPoints: function () {
        var self = this;

        return this.points.sort(function (a, b) {
            var polarA = self._findPolarAngle(self.anchorPoint, a);
            var polarB = self._findPolarAngle(self.anchorPoint, b);

            if (polarA < polarB) {
                return -1;
            }
            if (polarA > polarB) {
                return 1;
            }

            return 0;
        });
    },

    _checkPoints: function (p0, p1, p2) {
        var difAngle;
        var cwAngle = this._findPolarAngle(p0, p1);
        var ccwAngle = this._findPolarAngle(p0, p2);

        if (cwAngle > ccwAngle) {

            difAngle = cwAngle - ccwAngle;

            return !(difAngle > 180);

        } else if (cwAngle < ccwAngle) {

            difAngle = ccwAngle - cwAngle;

            return (difAngle > 180);

        }

        return false;
    },

    getHull: function () {
        var hullPoints = [],
            points,
            pointsLength;

        this.reverse = this.points.every(function(point){
            return (point.x < 0 && point.y < 0);
        });

        points = this._sortPoints();
        pointsLength = points.length;

        //If there are less than 4 points, joining these points creates a correct hull.
        if (pointsLength < 4) {
            return points;
        }

        //move first two points to output array
        hullPoints.push(points.shift(), points.shift());

        //scan is repeated until no concave points are present.
        while (true) {
            var p0,
                p1,
                p2;

            hullPoints.push(points.shift());

            p0 = hullPoints[hullPoints.length - 3];
            p1 = hullPoints[hullPoints.length - 2];
            p2 = hullPoints[hullPoints.length - 1];

            if (this._checkPoints(p0, p1, p2)) {
                hullPoints.splice(hullPoints.length - 2, 1);
            }

            if (points.length == 0) {
                if (pointsLength == hullPoints.length) {
                    return hullPoints;
                }
                points = hullPoints;
                pointsLength = points.length;
                hullPoints = [];
                hullPoints.push(points.shift(), points.shift());
            }
        }
    }
};

//----------------------------------------------------------------------


var me = {};
var humans, zombies;
var i, inputs, message;

var ashSpeed = 1000;
var ashKillRadius = 2000;
var zombieSpeed = 400;
var zombieKillRadius = 400;

var humanSaved = false;
var nearestHuman = { x:0, y:0 };

function distance( a, b ) {
  // printErr( JSON.stringify( a ) + " to " + JSON.stringify( b ));

  return Math.sqrt( Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2));
}

/**
 * If any zombie is a long way away we should defend.
 */
function zombiesAreFarAwayFrom( me ) {
  for (var i=0; i < zombies.length; i++) {
    if (distance( me, zombies[i]) > 8000) {
      return true;
    }
  }
  return false;
}

/**
 * find geomteric center of a set of zombies
 * https://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon
 */
function findCentroid( pts ) {

  var centroid = {
    x: 0.0,
    y: 0.0
  };

  var x0, y0;   // Current vertex
  var x1, y1;   // Next vertex
  var a = 0.0;  // Partial signed area
  var signedArea = 0.0;

  // For all vertices
  var numPts = pts.length;

  printErr("Finding centroid in pts: " + numPts );
  for (var i=0; i < numPts; ++i) {
    printErr("pt: " + pts[i].x + ", " + pts[i].y );

    x0 = pts[i].x;
    y0 = pts[i].y;
    x1 = pts[(i+1) % numPts].x;
    y1 = pts[(i+1) % numPts].y;
    a = x0*y1 - x1*y0;
    if (a === 0) {
      continue;  // skip if double point
    }
    signedArea += a;
    centroid.x += (x0 + x1)*a;
    centroid.y += (y0 + y1)*a;
  }

  signedArea *= 0.5;
  centroid.x /= (6.0*signedArea);
  centroid.y /= (6.0*signedArea);

  centroid.area = Math.abs( signedArea );

  printErr("area: " + Math.abs( signedArea ));
  // printErr( JSON.stringify( centroid ));

  return centroid;
}

/**
 * Finding a centroid only works on a non-intersecting polygon.
 * First find the hull of the zombie mass, then get the centroid.
 */
function findZombieCentroid() {

  var scanner = new ConvexHullGrahamScan();
  for (var i=0; i < zombies.length; i++) {
    scanner.addPoint( zombies[i].x, zombies[i].y );
  }
  var centroid = findCentroid( scanner.getHull() );

  if (!centroid.area || centroid.area > 27412127) {
    humanSaved = false;  // force retreat, area is too big to cover
  }

  if (!centroid.area) {
    findNearestSavableHuman( me );
  } else {
    print( Math.floor( centroid.x ) + " " + Math.floor( centroid.y  ) +
           " into the breach!");
  }
}


/**
 * Dumb alg to make a beeline for the nearest zombie.
 * Should really go to the nearest human in danger.
 */
function findNearestZombie( person ) {
  var zombie = undefined;
  var bestDistance = 100000;

  for (var i = 0; i < zombies.length; i++) {
    if (!zombies[i]) {  // this zombie is dead already..
      continue;
    }
    var zombieDistance = distance( person, zombies[i]);
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


/**
 * This human is within one step of us not reaching it in time
 */
function dangerLevel( human ) {

  var mostDanger = 1000;

  var turnsToSaveHuman = Math.ceil(
    (distance(me, human) - ashKillRadius) / ashSpeed );

  for (var i = 0; i < zombies.length; i++) {
    var turnsBeforeZombieKillsHuman = Math.ceil(
      (distance( zombies[i], human) - zombieKillRadius) / zombieSpeed );

    var danger = turnsBeforeZombieKillsHuman - turnsToSaveHuman;
    if ((danger >= 0) && (danger < mostDanger)) {
      mostDanger = danger;
    }
  }
  return mostDanger;   // this guy is OK for now.  Or walking dead
}


/**
 * This works by guarnteeing one saved human.
 */
function findNearestSavableHumanInMostDanger( me ) {
  var human = undefined;
  var bestDistance = 100000;
  var worstDanger = 1000;  // turns until death

  for (var i = 0; i < humans.length; i++) {
    var danger = dangerLevel( humans[i] );
    var humanDistance = distance( me, humans[i]);

    // break ties based on distance?
    if ((danger < worstDanger)) {
      // if ((humanDistance < bestDistance) && humanInDanger( humans[i] )) {
//      if (isHumanSavable( humans[i], me )) {
        human = humans[i];
        worstDanger = danger;
        bestDistance = humanDistance;
//      }
    }
  }

  if (human) {
    printErr("Human in danger! " + worstDanger);
    print( human.x + " " + human.y + " " + message);
  } else {
    return null;
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
    zombies.push(
      {
        id: parseInt(inputs[0]),
        x: parseInt(inputs[1]),
        y: parseInt(inputs[2]),
        nextX: parseInt(inputs[3]),  // where zombie is headed (human)
        nextY: parseInt(inputs[4])
      });
  }

  if (!findNearestSavableHumanInMostDanger( me )) {  // search for damsels
     findNearestSavableHuman( me );  // stand your ground!
   }

/*
 if (!humanSaved) {
   if (!findNearestSavableHumanInDanger( me )) {  // search for damsels
     findNearestSavableHuman( me );  // stand your ground!
   }
  } else {
    findNearestZombie( me );
  }


  if (!humanSaved) { //  || zombiesAreFarAwayFrom( me )) {
    findNearestSavableHuman( me );  // stand your ground!
  } else {
    // findNearestZombie( me );
    if (zombies.length > 2) {
      findZombieCentroid();
    } else {
      findNearestZombie( me );        // attack!
      // findNearestSavableHuman( me );  // stand your ground!
    }
  }
*/
}
