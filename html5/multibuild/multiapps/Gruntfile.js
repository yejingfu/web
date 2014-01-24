module.exports = function(grunt){

    grunt.initConfig({
	jshint:{
	    options:{
		debug: true,     //susppend warning about debugger statement
		smarttabs: true,  // allow mixed spaces and tabs
		globals:{
		    jquery: true,
		    $: true
		}
	    },
	    all:['siteversion/**/*.js']
	},
	requirejs:{
	    compile:{
		options:{
		    appDir: ".",
		    baseUrl: ".",
		    paths:{
			requireLib: "./siteversion/core/libs/require",
			nodeModules: "./node_modules",
			math: "./siteversion/core/scripts/math",
			geom: "./siteversion/core/scripts/geom"
		    },
		    dir: "./build",
		    keepBuildDir: false,
		    include: "requireLib",
		    optimize: "uglify2",
		    closure:{
			CompilerOptions:{},
			CompilationLevel: 'ADVANCED_OPTIMIZATIONS',
			loggingLevel: 'WARNING'
		    },
		    skipDirOptimize: false,
		    removeCombined: true,
		    generateSourceMaps: false,
		    fileExclusionRegExp: /node_modules|^\./,
		    modules:[
			{
			    name:"siteversion/app-a/application"
			},
			{
			    name:"siteversion/app-b/application"
			}
		    ]
		}
	    }
	}
    });

    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // run this task by call $grunt test
    grunt.registerTask('test', 'Log some stuff', function(){
	grunt.log.write('Jeff Ye--Logging some stuff').ok();
    });

    // default task
    grunt.registerTask('default', ['jshint', 'requirejs']);
};
