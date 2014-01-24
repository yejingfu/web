define(['b', 'c'], function(B, C){
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
