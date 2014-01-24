requirejs.config({
    baseUrl: "../",
    paths: {
	geom: "core/scripts/geom",
	math: "core/scripts/math"
    }
});

/*
require(['/siteversion/core/scripts/math/api.js', '/siteversion/core/scripts/geom/api.js'],
function(math, geom){
    debugger;
    var p1 = math.Point2.create(10, 10);
    var p2 = math.Point2.create(20, 20);
    var line = geom.Line2.create(p1, p2);
    console.log(line.curveType());
    console.log(line.toString());
});
 */
debugger;
require(['geom/api', 'math/api'], function(geom, math){
    var p1 = math.Point2.create(10, 10);
    var p2 = math.Point2.create(20, 20);
    var line = geom.Line2.create(p1, p2);
    console.log(line.curveType());
    console.log(line.toString());
});
