define(['bracelet'],
    function(bracelet) {

/**
The global application.
@class Application
@since 1.0.0
@constructor
**/
var Application = function(cfg) {
    this.cfg = cfg;
    this.activeView = null;
};

Application.prototype = {

    /**
    Set ative tab accoring to the current url path.
    @method setActiveView
    @param {String} path The location of current page.
    @since 1.0.0
    **/
    setActiveView: function(path) {
        if (path.indexOf('/bracelet') === 0) {
            $('#nav_bracelet').attr('class', 'active');
            this.activeView = bracelet.create(this);
        } else {
            console.error('wrong page: ' + path + '!');
        }
    },

    /**
    Run the application.
    @method run
    @since 1.0.0
    **/
    run: function() {
        if (this.activeView) {
            this.activeView.initialize();
            this.activeView.show();
        }
    }
};

return {
    createApp: function(cfg) {
        return new Application(cfg);
    }
};

});