define(['common'], function(common) {

/**
The Bracelet stuffs.
@class Bracelet
@since 1.0.0
@constructor
**/
var Bracelet = function(app) {
    common.View.call(this, app);
};

Bracelet.prototype = new common.View();

/**
Intialize the Bracelet.
@method intialize
**/
Bracelet.prototype.initialize = function() {
    common.View.prototype.initialize.apply(this, arguments);
    console.log('Bracelet.initialize()');
};

/**
Launch the Bracelet.
@method show
**/
Bracelet.prototype.show = function() {
    common.View.prototype.show.apply(this, arguments);
    console.log('Bracelet.show()');
};

return {
    create: function(app) {
        return new Bracelet(app);
    }
};

});