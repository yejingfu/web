define(function() {

/**
@class Viewport
**/
var Viewport = function(editor) {
    this.editor = editor;
    // create grid plane
    this.grid = new THREE.GridHelper(editor.config.get('grid').size, editor.config.get('grid').step);
    this.editor.auxScene.add(this.grid);
};

return {
    Viewport: Viewport
};

});