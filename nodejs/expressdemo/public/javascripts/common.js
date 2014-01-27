define(function() {

/**
The base class for views.
@class View
@since 1.0.0
@constructor
**/
var View = function(app) {
    this.app = app;
};

View.prototype = {

    /**
    Do initializations.
    @method intialize
    @since 1.0.0
    **/
    initialize: function() {
        console.log('View.initialize');
    },

    /**
    Display the view contents.
    @method show
    @since 1.0.0
    **/
    show: function() {
        console.log('View.show');
    }
};

return {
    View: View
};

});