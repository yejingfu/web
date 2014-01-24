define(['math/api'], function(math){

    return {
	
    Math: math,
    
    External:{
	Constants: {
	    CurveTypeEnum:{
		Unknown: 0,
		Line2: 1,
		Line3: 2,
		CircularArc2: 4,
		CircularArc3: 5
	    }
	}
    },
    
    Internal:{
    }

    };
});
