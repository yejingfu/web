define(['common'], function(common) {

/**
The tutorials stuffs.
@class Tutorials
@since 1.0.0
@constructor
**/
var Tutorials = function(app) {
    common.View.call(this, app);
};

Tutorials.prototype = new common.View();

/**
Intialize the tutorial.
@method intialize
**/
Tutorials.prototype.initialize = function() {
    common.View.prototype.initialize.apply(this, arguments);
    console.log('Tutorials.initialize()');
};

/**
Launch the tutorials.
@method show
**/
Tutorials.prototype.show = function() {
    common.View.prototype.show.apply(this, arguments);
    console.log('Tutorials.show()');
};


return {
    create: function(app) {
        return new Tutorials(app);
    }
};

});