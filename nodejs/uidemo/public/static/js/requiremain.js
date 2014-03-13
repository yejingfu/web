// the main of require.js
// the "baseUrl" attribute will be set this same folder as requiremain.js.

requirejs.config({
    baseUrl: '/static/js',
    paths: {
        lib: 'libs',
        threejs: 'libs/three',
        signals: 'libs/signals'
    }
});

requirejs(['threejs'], function(threejs) {   // the jquery should be firstly loaded because bootstrap requires it.

requirejs(['app'], function(application) {
    var app = application.createApp({title: 'jeff'});
    app.setActiveView(location.pathname);
    app.run();
});

});