({
    // The project directory, relateive to the current directory.
    appDir: ".",

    // The basic url path, relative to the appDir.
    baseUrl: ".",

    // The path list of 3rd modules
    paths:{
	requireLib: "./core/libs/require",
	math: "./siteversion/core/scripts/math",
	geom: "./siteversion/core/scripts/geom"
    },
    
    // The out directory of build
    dir: "./build",

     //re-build each time
    keepBuildDir: false,
    
    // combine the other libraries, such as jquery or require, into the target minified file.
    include : "requireLib",
    
    // Turn on/off minified. Used for debugging. options: uglify/uglify2/closure(require java)
    optimize: "uglify2",

    // This is bug about compiler: https://github.com/jrburke/r.js/issues/238
    closure: {
        CompilerOptions: {},
        CompilationLevel: 'ADVANCED_OPTIMIZATIONS', //'SIMPLE_OPTIMIZATIONS',
        loggingLevel: 'WARNING'
    },
    
    skipDirOptimize: false,

    removeCombined: true,
    
    generateSourceMaps: false,


    modules:[
	{
	    // The first application
	    name: "siteversion/app-a/application"
        },
	{
	    // The second application
	    name: "siteversion/app-b/application"
	}
    ]
    
})
