requirejs.config({
    baseUrl: "../",
    paths: {
	geom: "core/scripts/geom",
	math: "core/scripts/math"
    }
});


require(['math/api', 'geom/api'],
function(math, geom){
    var from = math.Point2.create(0, -1);
    var to = math.Point2.create(99, 98);
    var line = geom.Line2.create(from, to);
    console.log(line.toString());
});
