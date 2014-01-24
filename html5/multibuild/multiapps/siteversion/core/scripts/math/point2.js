define(['math/module'], function(module){

    var e = module.External;

    e.Point2 = function(x, y){
	this.x = x || 0;
	this.y = y || 0;
    };

    e.Point2.prototype = {
	moveBy: function(deltaX, deltaY){
	    this.x += deltaX;
	    this.y += deltaY;
	},

	clone: function(){
	    return new e.Point2(this.x, this.y);
	},

	toString: function(){
	    return 'point2:['+this.x + ',' + this.y+']';
	}
    };

    e.Point2.create = function(x, y){
	return new e.Point2(x, y);
    };

    return e.Point2;
});
