define(['c'], function(C){
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
