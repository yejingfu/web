define(['home', 'editor', 'community', 'collaboration', 'contacts', 'tutorials'],
    function(home, editor, community, collab, contacts, tutorials) {

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
        if (path.indexOf('/home') === 0) {
            $('#nav_home').attr('class', 'active');
            this.activeView = home.create(this);
        } else if (path.indexOf('/tutorials') === 0) {
            $('#nav_turorials').attr('class', 'active');
            this.activeView = tutorials.create(this);
        } else if (path.indexOf('/editor') === 0) {
            $('#nav_editor').attr('class', 'active');
            this.activeView = editor.create(this);
        } else if (path.indexOf('/community') === 0) {
            $('#nav_community').attr('class', 'active');
            this.activeView = community.create(this);
        } else if (path.indexOf('/collaboration') === 0) {
            $('#nav_collaboration').attr('class', 'active');
            this.activeView = collab.create(this);
        } else if (path.indexOf('/contacts') === 0) {
            $('#nav_contacts').attr('class', 'active');
            this.activeView = contacts.create(this);
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