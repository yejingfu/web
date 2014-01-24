define(['math/module'], function(module){
    var e = module.External;

    e.Point3 = function(x, y, z){
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
    };

    e.Point3.prototype = {
	moveBy: function(deltaX, deltaY, deltaZ){
	    this.x += deltaX;
	    this.y += deltaY;
	    this.z += deltaZ;
	},

	clone: function(){
	    return e.Point3(this.x, this.y, this.z);
	},

	toString: function(){
	    return 'point3:['+this.x + ',' + this.y + ',' + this.z +']';
	}
    };

    e.Point3.create = function(x, y, z){
	return new e.Point3(x, y, z);
    };

    return e.Point3;
});
