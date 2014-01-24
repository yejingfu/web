define(['geom/module'], function(module){
    var e = module.External;
    
    e.Curve = function(curveType){
	this._curveType = curveType;
    };

    e.Curve.prototype = {
	curveType: function(){
	    return this._curveType;
	}
    };

    e.Curve.create = function(curveType){
	return new e.Curve(curveType);
    };

    return e.Curve;
});
