var addon = require('./build/Release/hellonan');
var calculations = process.argv[2] || 100000000;

function printResult(t, pi, ms) {
    console.log(t, 'method:');
    console.log('\tpi = ' + pi + ' (' + Math.abs(pi - Math.PI) + ' away from actual');
    console.log('\tTook ' + ms + ' ms');
    console.log();
}

function runSync() {
    var start = Date.now();
    var res = addon.calculateSync(calculations);
    printResult('Sync', res, Date.now() - start);
}

function runAsync() {
    var batches = process.argv[3] || 16;
    var ended = 0;
    var total = 0;
    var start = Date.now();

    function done(err, result) {
	total += result;
	if (++ended == batches) {
	    printResult('Async', total / batches, Date.now() - start);
	}
    }

    for (var i = 0; i < batches; i++) {
	addon.calculateAsync(calculations / batches, done);
    }
}

runSync();
runAsync();


