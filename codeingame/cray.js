/**
 * SuperComputer scheduler
 * Codeingame
 * 
 * 2015, David Whitney (dwhitnee)
 */

var n = parseInt(readline());
var jobs = [];
for (var i = 0; i < n; i++) {
    var inputs = readline().split(' ');
    var startingDay = parseInt(inputs[0]);
    var durationDays = parseInt(inputs[1]);
    jobs.push({
        start: startingDay,
        duration: durationDays
    });
}

var cpu = [];
var jobCount = 0;

//----------------------------------------
function isCpuFree( job ) {
  for (var i=job.start; i < job.start + job.duration; i++) {
    if (cpu[i]) {
      return false;
    }
  }
  return true;
}

//----------------------------------------
function scheduleCpu( job ) {
  jobCount++;
  for (var i=job.start; i < job.start + job.duration; i++) {
    cpu[i] = true;
  }
}

// FIFO, sort by starting day
function fifoFavorShortJobs( a, b ) {
  if (a.start === b.start) {
    return a.duration < b.duration;
  } else {
    return a.start < b.start; 
  }
}

jobs.sort( fifoFavorShortJobs );

printErr( JSON.stringify( jobs ));

for (i = 0; i < jobs.length; i++) {
  var start = jobs[i].start;
  if (isCpuFree( jobs[i] )) {
    scheduleCpu( jobs[i] );
  }
}

print( jobCount );
