/**
 * Bender's money machine on codingame.com
 *
 * 2015, dwhitnee@gmail.com
 */
/*global print, printErr, readline */


var n = parseInt(readline());

var Room = (function() {
  function Room( id, money, exit1, exit2) {
    this.id = id;
    this.money = money|0;  // convert to int
    this.exit1 = exit1;
    this.exit2 = exit2;
  }

  Room.prototype = {
    isAnExit: function() {
      return this.id === "E";
    },
    setCachedMoney: function( val ) {
      this.cachedMoney = val;
    },
    getCachedMoney: function() {
      return this.cachedMoney;
    },

    // chalk the room
    visit: function() {
      this.visited = true;
    },
    unvisit: function() {
      this.visited = false;
    },
    hasBeenVisited: function() {
      return this.visited;
    },

    // never visit again, ever
    lock: function() {
      this.locked = true;
    },

    // turn room id's into ptrs, not strictly necessary...
    connectExits: function( rooms ) {
      this.exit1 = rooms[this.exit1];
      this.exit2 = rooms[this.exit2];
    },
    toString: function() {
      var str = "Room " + this.id + " ($ " + this.money + ")";
      if (this.isAnExit()) {
        str += " is an exit";
      } else {
        str += " connects to rooms " + this.exit1.id + " and " + this.exit2.id;
      }
      return str;
    }
  };
  return Room;
})();

function traverseRooms2( rooms, room, markAsTravelled ) {
  var money1 = -1;
  var money2 = -1;
  var justPassingThrough = false;

  log("Bender is in room: " + room.id );

  // exit condition, literally
  if (room.isAnExit() ) {
    return 0;
  }

  if (markAsTravelled && markAsTravelled.tentative === true) {
    room.visit();
  } else if (markAsTravelled && markAsTravelled.tentative ===  false)  {
    room.unvisit();  // we are cleaning up
    justPassingThrough = true;
  }

  if (markAsTravelled && markAsTravelled.permanent === true) {
    room.lock();
  }

  // go left and right and see which is better
  // keep "isVisited" up to date.
  if (!room.exit1.locked &&
      (justPassingThrough || !room.exit1.hasBeenVisited()))
  {
    money1 = traverseRooms( rooms, room.exit1, { tentative: true });
    traverseRooms( rooms, room.exit1, { tentative: false }); // unmark path
  }

  if (!room.exit2.locked &&
      (justPassingThrough || !room.exit2.hasBeenVisited()))
  {
    money2 = traverseRooms( rooms, room.exit2, { tentative: false });
    traverseRooms( rooms, room.exit2, { tentative: false }); // unmark path
  }

  if ((money1 < 0) && (money2 < 0)) {
    return 0;
  }

  var outMoney = room.money;

  if (money1 > money2) {
    traverseRooms( rooms, room.exit1, { permanent: true });  // lock the rooms
    outMoney += money1;
    log("Bender went to: " + room.exit1.id  + " with " + outMoney);

  } else {
    traverseRooms( rooms, room.exit2, { permanent: true });  // lock the rooms
    outMoney += money2;
    log("Bender went to: " + room.exit2.id  + " with " + outMoney);
  }

  return outMoney;
}

//----------------------------------------------------------------------
function traverseRooms( rooms, room ) {
  var money1 = -1;
  var money2 = -1;
  var outMoney = room.getCachedMoney();

  log("Bender is in room: " + room.id );

  // exit condition, literally
  if (room.isAnExit() ) {
    return 0;
  }

  if (!outMoney) {
    money1 = traverseRooms( rooms, room.exit1, { tentative: true });
    money2 = traverseRooms( rooms, room.exit2, { tentative: false });

    outMoney = room.money;

    if (money1 > money2) {
      outMoney += money1;
    } else {
      outMoney += money2;
    }
  }

  room.setCachedMoney( outMoney );
  return outMoney;
}



var rooms = {};

for (var i = 0; i < n; i++) {
  var inputs = readline().split(' ');
  rooms[inputs[0]] = new Room( inputs[0], inputs[1], inputs[2], inputs[3]);
}

rooms["E"] = new Room("E", 0, "E", "E");

for (var r in rooms ) {
  rooms[r].connectExits( rooms );
}

logRooms( rooms );

print( traverseRooms( rooms, rooms[0] ));




function logRooms( rooms ) {
  for (var r in rooms ) {
    log( rooms[r].toString() );
  }
}

function log( str ) {
  // printErr( str );
}
