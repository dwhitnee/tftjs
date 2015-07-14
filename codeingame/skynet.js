/**
 * Skynet: the Virus  problem on codingame.com
 *
 * 2015, dwhitnee@gmail.com
 */

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
  var N1 = parseInt(inputs[0]); // N1 and N2 defines a link between these nodes
  var N2 = parseInt(inputs[1]);
  printErr( N1 + " " + N2);

  nodes[N1].links.push( N2 );
  nodes[N2].links.push( N1 );
}

for (var i = 0; i < numExits; i++) {
  var EI = parseInt(readline()); // the index of a gateway node
  if (!nodes[EI]) nodes[EI] = {};
  nodes[EI].isGateway = true;

}

function removeLink(a, b) {
  printErr("Removing " + a + " to " + b);
  nodes[a].links.splice( nodes[a].links.indexOf(b), 1);
  nodes[b].links.splice( nodes[b].links.indexOf(a), 1);
  print(a+" "+b);
}

// game loop
var done;
while (true) {
  printErr( JSON.stringify( nodes ));
  var skynet = parseInt(readline()); // The index of the node on which the Skynet agent is positioned this turn
  done = false;
  // First cut any link between skynet and an immediate exit
  var dangerousLinks = nodes[skynet].links;
  printErr("Near skynet: " + dangerousLinks);
  for (var i = dangerousLinks.length-1; i; i--) {
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
