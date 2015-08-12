/**
 * Skynet strikes back on codingame.com
 * Now we can only sever links to gateways
 * 
 * 2015, dwhitnee@gmail.com
 */
/*global print, printErr, readline */


var inputs = readline().split(' ');
var numNodes = parseInt(inputs[0]); // the total number of nodes in the level, including the gateways
var numLinks = parseInt(inputs[1]); // the number of links
var numExits = parseInt(inputs[2]); // the number of exit gateways
var nodes = [];

var Node = (function() 
{
  function Node( id ) {
    this.id = id;
    this.links = [];
 }
  Node.prototype = {
    linkTo: function( otherNode ) {
      this.links.push( otherNode.id );
      otherNode.links.push( this.id );
    },
    hasLinks: function() {
      return this.links.length > 0;
    },
    /**
     * remove any link to a gateway
     */
    removeAnyLink: function() {
      log("removing any link from " + this.id);
      for (var i=0; i < this.links.length; i++) {
        var otherNode = nodes[this.links[i]];
        if (this.isGateway || otherNode.isGateway) {
          this.removeLink( otherNode );
          return;
        }
      }
    },
    removeLink: function( otherNode ) {
      log("Removing " + this.id + " to " + otherNode.id);
      this.links.splice( this.links.indexOf( otherNode.id ), 1);
      otherNode.links.splice( otherNode.links.indexOf( this.id ), 1);
      print(this.id + " " + otherNode.id);
    },
    /**
     *  list of linked node ids that are gateways
     */
    gateways: function() {
      return this.links.filter( function( link ) { return nodes[link].isGateway; } );
    },
    /**
     * Has active links to more than one gateway
     */
    hasGateways: function( minGateways ) {
      var gateways = 0;
      for (var i=0; i < this.links.length; i++) {
        if (nodes[this.links[i]].isGateway) {
          gateways++;
        }
      }
      return gateways >= minGateways;
    },
    toString: function() {
      var str = this.id + " [links: " + this.links + "]";
      if (this.isGateway) {
        str += " (gateway)";
      }
      return str;
    }
  };
  return Node;
})();


// build list of nodes
for (var i = 0; i < numNodes; i++) {
  nodes[i] = new Node(i);
}

// build network
for (i = 0; i < numLinks; i++) {
  inputs = readline().split(' ');
  var n1 = parseInt(inputs[0]); // N1 and N2 defines a link between these nodes
  var n2 = parseInt(inputs[1]);
  log( n1 + " " + n2);

  nodes[n1].linkTo( nodes[n2] );
}

// identify gateways
for (i = 0; i < numExits; i++) {
  var id = parseInt(readline()); // the index of a gateway node
  nodes[id].isGateway = true;
}

var gateways = [];
for (i=0; i < nodes.length; i++) {
  if (nodes[i].isGateway) {
    gateways.push( nodes[i] );
  }
}

var multiGatewayNodes = [];
for (i=0; i < nodes.length; i++) {
  if (nodes[i].gateways().length > 1) {
    multiGatewayNodes.push( nodes[i] );
  }
}

var foundALinkToCut;

while (true) {
  logNodes("All: ", nodes );

  // The index of the node on which the Skynet agent is positioned this turn
  var skynetNode = nodes[parseInt(readline())];
  
  foundALinkToCut = false;

  // First cut any link 
  // 1. between skynet and an immediate exit
  // 2. between skynet and a node with two exits
  // 3. Any node with multiple gateways that are two hops away (FIXME)
  var dangerousLinks = skynetNode.links;
  log("Near skynet: " + dangerousLinks );

  for (i = 0; i < dangerousLinks.length; i++) {
    var potentialDanger = nodes[dangerousLinks[i]];
    log("Checking skynet's link " + skynetNode.id + " to " + dangerousLinks[i]);
    if (potentialDanger.isGateway) {
      log(potentialDanger.id + " is a gatway - kill it");
      foundALinkToCut = true;
      skynetNode.removeLink( potentialDanger );
      break;
    }
  }
  for (i = 0; !foundALinkToCut && i < dangerousLinks.length; i++) {
    var potentialDanger = nodes[dangerousLinks[i]];
    if (potentialDanger.hasGateways(2)) {
      log(potentialDanger.id + " has multiple gateway - kill one of the gateways");
      foundALinkToCut = true;
      potentialDanger.removeAnyLink();
      break;
    }
  }
  
  // FIXME - look for hasGateways(2) on potentialDanger's neighbors
  for (i = 0; !foundALinkToCut && i < dangerousLinks.length; i++) {
    var potentialDanger = nodes[dangerousLinks[i]];
    for (var l=0; l < potentialDanger.links.length; l++) {
      var potentialFarDanger = nodes[ potentialDanger.links[l] ];
      if (potentialFarDanger.hasGateways(2)) {
        log( potentialFarDanger.id + " his far and as multiple gateway - kill one of the gateways");
        foundALinkToCut = true;
        potentialFarDanger.removeAnyLink();
        break;
      }
    }
  }

  // cut ANY double before a single
  for (i = 0; !foundALinkToCut && i < nodes.length; i++) {
    var potentialDanger = nodes[i];
    if (potentialDanger.hasGateways(2)) {
      log("random node " + potentialDanger.id +
          " has multiple gateways - kill one of the gateways");
      foundALinkToCut = true;
      potentialDanger.removeAnyLink();
      break;
    }
  }


  for (i = 0; !foundALinkToCut && i < dangerousLinks.length; i++) {
    var potentialDanger = nodes[dangerousLinks[i]];
    if (potentialDanger.hasGateways(1)) {
      log(potentialDanger.id + " has a single gateway - kill it");
      foundALinkToCut = true;
      potentialDanger.removeAnyLink();
      break;
    }
  }

  // Second cut any link between skynet and a node with two exits
  // Find any node with 2 gateways and cut one

  // cut any gateway link
  if (!foundALinkToCut) {
    for (i=0; i < gateways.length; i++) {
      var node = gateways[i];
      if (node.links.length > 0) {
        log("removing a gateway");
        node.removeAnyLink();
        foundALinkToCut = true;
        break;
      }
    }
    
  }
}

function logNodes( str,  nodes ) {
  log( str + "\n" + nodes.map( function( node ) { return node.toString(); }).join("\n") );
}

function log( str ) {
  printErr( str );
}