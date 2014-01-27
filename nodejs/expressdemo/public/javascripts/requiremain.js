// the main of require.js
// the "baseUrl" attribute will be set this same folder as requiremain.js.

requirejs.config({
    baseUrl: 'javascripts',
    paths: {
        lib: 'libs',
        jquery: 'libs/jquery-2.0.3',
        bootstrap: 'libs/bootstrap'
    }
});

requirejs(['jquery'], function($) {   // the jquery should be firstly loaded because bootstrap requires it.

requirejs(['bootstrap', 'app'], function(bs, application){
    var app = application.createApp({title: 'jeff'});
    app.setActiveView(location.pathname);
    app.run();
});

});