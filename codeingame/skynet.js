/**
 * Skynet: the Virus  problem on codingame.com
 *
 * 2015, dwhitnee@gmail.com
 */
/*global print, printErr, readline */


var inputs = readline().split(' ');
var numNodes = parseInt(inputs[0]); // the total number of nodes in the level, including the gateways
var numLinks = parseInt(inputs[1]); // the number of links
var numExits = parseInt(inputs[2]); // the number of exit gateways

var nodes = [];

for (var i = 0; i < numNodes; i++) {
  nodes[i] = { links: [] };
}

for (i = 0; i < numLinks; i++) {
  inputs = readline().split(' ');
  var n1 = parseInt(inputs[0]); // N1 and N2 defines a link between these nodes
  var n2 = parseInt(inputs[1]);
  printErr( n1 + " " + n2);

  nodes[n1].links.push( n2 );
  nodes[n2].links.push( n1 );
}

for (i = 0; i < numExits; i++) {
  var id = parseInt(readline()); // the index of a gateway node
  nodes[id] = nodes[id] || {};
  nodes[id].isGateway = true;
}

function removeLink(a, b) {
  printErr("Removing " + a + " to " + b);
  nodes[a].links.splice( nodes[a].links.indexOf(b), 1);
  nodes[b].links.splice( nodes[b].links.indexOf(a), 1);
  print(a+" "+b);
}



var done = false;

while (true) {
  printErr( JSON.stringify( nodes ));

  // The index of the node on which the Skynet agent is positioned this turn
  var skynet = parseInt(readline());

  done = false;
  // First cut any link between skynet and an immediate exit
  var dangerousLinks = nodes[skynet].links;
  printErr("Near skynet: " + dangerousLinks);

  for (i = dangerousLinks.length-1; i; i--) {
    var potentialExit = dangerousLinks[i];

    printErr("Checking link " + skynet + " to " + dangerousLinks[i]);
    if (nodes[potentialExit].isGateway) {
      done = true;
      removeLink( skynet, potentialExit );
      break;
    }
  }

  // Second, cut all links to exits
  if (!done) {
    //removeLink( skynet, nodes[skynet].links[nodes[skynet].links.length-1] );
    removeLink( skynet, nodes[skynet].links[0] );
  }
}
