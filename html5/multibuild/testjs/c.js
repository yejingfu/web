define(['a'], function(A){
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
