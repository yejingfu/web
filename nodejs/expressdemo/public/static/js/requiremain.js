// the main of require.js
// the "baseUrl" attribute will be set this same folder as requiremain.js.

requirejs.config({
    baseUrl: 'static/js',
    paths: {
        lib: 'libs',
        jquery: 'libs/jquery-2.0.3',
        bootstrap: 'libs/bootstrap',
        //threejs: 'http://cdn.bootcss.com/three.js/r61/three',
        threejs: 'libs/three',
        signals: 'libs/signals'
    }
});

requirejs(['jquery', 'threejs'], function($, threejs) {   // the jquery should be firstly loaded because bootstrap requires it.

requirejs(['bootstrap', 'app'], function(bs, application) {
    var app = application.createApp({title: 'jeff'});
    app.setActiveView(location.pathname);
    app.run();
});

});