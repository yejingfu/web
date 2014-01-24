define(['geom/curve', 'geom/module'], function(curve, module){

    var e = module.External;
    var m = module.Math;
    e.Line2 = function(p1, p2){
	curve.apply(this, [e.Constants.CurveTypeEnum.Line2]);
	if (p1 instanceof m.Point2 && p2 instanceof m.Point2){
	    this.startPoint = p1.clone();
	    this.endPoint = p2.clone();
	} else {
	    this.startPoint = m.Point2.create();
	    this.endPoint = m.Point2.create();
	}
    };

    e.Line2.prototype = curve.create();
    
    e.Line2.prototype.startPoint = function(){
	return this.startPoint;
    };

    e.Line2.prototype.endPoint = function(){
	return this.endPoint;
    };

    e.Line2.prototype.toString = function(){
	return 'Line2(type:' + this.curveType() + '; startPoint:'+this.startPoint.toString() + '; endPoint:'+this.endPoint.toString()+')';
    };

    e.Line2.create = function(startPoint, endPoint){
	return new e.Line2(startPoint, endPoint);
    };

    return e.Line2;
});
