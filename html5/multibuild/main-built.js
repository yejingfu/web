
define('c',['a'], function(A){
    console.log('in define of c.js');
    return {
	hello: function(){
	    console.log('Begin Hello C');
        console.log('call A.toString() in C');
	    console.log('End Hello C');
	},
	toString: function(){
	    return 'C';
	}
    };
});

define('b',['c'], function(C){
    console.log('in define of b.js');
    return {
	hello: function(){
	    console.log('Begin Hello B');
	    C.hello();
	    console.log('End Hello B');
	},
	toString: function(){
	    return 'B';
	}
    };
});

define('a',['b', 'c'], function(B, C){
    console.log('in define of a.js');
    return {
	hello: function(){
	    console.log('Begin Hello A');
	    B.hello();
	    C.hello();
	    console.log('End Hello A');
	},
	toString: function(){
	    return 'A';
	}
    };
});


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

define("main", function(){});
