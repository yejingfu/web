define(['common'], function(common) {

/**
The Community stuffs.
@class Community
@since 1.0.0
@constructor
**/
var Community = function(app) {
    common.View.call(this, app);
};

Community.prototype = new common.View();

/**
Intialize the community.
@method intialize
**/
Community.prototype.initialize = function() {
    common.View.prototype.initialize.apply(this, arguments);
    console.log('Community.initialize()');
};

/**
Launch the community.
@method show
**/
Community.prototype.show = function() {
    common.View.prototype.show.apply(this, arguments);
    console.log('Community.show()');
};


return {
    create: function(app) {
        return new Community(app);
    }
};

});