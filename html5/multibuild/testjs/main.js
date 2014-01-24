
/*
define(function() {
    var sayHello = function() {
	alert('sayHello');
    };

    return {
	sayHello: sayHello
    };
});
*/

console.log('Begin main.js');

require(['a'], function(A) {
    A.hello();
    console.log(A.toString());
});

console.log('End main.js');
