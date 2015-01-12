var method = function (obj) {
    console.log('Child: '+ process.threadId);
    var t = 0;
    for (var i = 0; i < obj.count; i++) {
        for (var z = 0; z < 100000; z++) {
            t += z % 2;
        }
    }
    return {total: t};
};

var start;// = process.hrtime();
setInterval(function () {
    start = process.hrtime();
    console.log('start child thread at: ' + start);
    jxcore.tasks.addTask(method, {count: 1000}, function (result) {
        console.log('Main: returned from child: ', result.total);
    });
}, 1000);

// event handler
jxcore.tasks.on('emptyQueue', function () {
    console.log('Main: total time spent: ', process.hrtime(start), process.memoryUsage());
});

