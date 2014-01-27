define(['common'], function(common) {

/**
The 3D modeling editor.
@class Editor
@since 1.0.0
@constructor
**/
var Editor = function(app) {
    common.View.call(this, app);
};

Editor.prototype = new common.View();

/**
Intialize the editor.
@method intialize
**/
Editor.prototype.initialize = function() {
    common.View.prototype.initialize.apply(this, arguments);
    console.log('Editor.initialize');
};

/**
Launch the editor.
@method show
**/
Editor.prototype.show = function() {
    common.View.prototype.show.apply(this, arguments);
    console.log('Editor.show()');
};

return {
    create: function(app) {
        return new Editor(app);
    }
};

});