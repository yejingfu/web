define(['common'], function(common) {

/**
The Home stuffs.
@class Home
@since 1.0.0
@constructor
**/
var Home = function(app) {
    common.View.call(this, app);
};

Home.prototype = new common.View();

/**
Intialize the community.
@method intialize
**/
Home.prototype.initialize = function() {
    common.View.prototype.initialize.apply(this, arguments);
    console.log('Home.initialize()');
};

/**
Launch the community.
@method show
**/
Home.prototype.show = function() {
    common.View.prototype.show.apply(this, arguments);
    console.log('Home.show()');
};


return {
    create: function(app) {
        return new Home(app);
    }
};

});