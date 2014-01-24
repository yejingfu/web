({
    baseUrl: "./testjs",
    // The path is relative to the baseUrl.
    paths:{
	requireLib: "../libs/require"
    },
    name: "main",
    // combine the other libraries, such as jquery or require, into the target minified file.
//    include : "requireLib",
    // Turn on/off minified. Used for debugging.
    optimize: "none",
    out: "main-built.js"
})
