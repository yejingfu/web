var primitiveList = {
primitives: [
{id:'cube', name:'Cube', desc:'The cube info', category:'geometry', color:[255, 0, 0], scale:[1, 1, 1]},
{id:'cyliner', name:'Cylinder', desc:'The cylinder info', category:'geometry', color:[255, 255, 0], scale:[1, 1, 1]},
{id:'sphere', name:'Sphere', desc:'The sphere info', category:'geometry', color:[255, 0, 255], scale:[1, 1, 1]},
{id:'torus', name:'Torus', desc:'The torus info', category:'geometry', color:[0, 0, 255], scale:[1, 1, 1]}
]};

var asmAddon;
var loadAsmAddon = function() {
    if (asmAddon !== undefined) {
        return asmAddon;
    }
    console.log('Loading asm addon...');
    asmAddon = require('./../asm/lib/solidmodelingapi.js').api;
    asmAddon.initialize();
    return asmAddon;
};

var unloadAsmAddon = function() {
    if (asmAddon !== undefined) {
        asmAddon.uninitialize();
        asmAddon = undefined;
    }
};

exports.test = function() {
    loadAsmAddon();
    //var blockHandle = asmAddon.createBlock(0, 0, 0, 1, 1, 1);
    var blockHandle = asmAddon.createCylinder(0, 0, 0, 2, 2, 2, 1);
    console.log(asmAddon.jsonGraphicsFromBody(blockHandle));
};

exports.primitives = function(req, res, method) {
    console.log('primitives: ' + method);
    res.end(JSON.stringify(primitiveList));
};

exports.primitiveById = function(req, res, method) {
    console.log('primtiveById[' + req.params.id + ']: ' + method);
    //console.log('query:' + JSON.stringify(req.query));
    //console.log('body:'+JSON.stringify(req.body));
    var id = req.params.id;
    var xforms =[];
    xforms.push([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
    switch (method) {
        case 'GET':
        var handles = [];
        if (id === 'block') {
            handles.push(asmAddon.createBlock(-0.5, 0, -0.5, 0.5, 1, 0.5));
        } else if (id === 'cylinder') {
            handles.push(asmAddon.createCylinder(0, 0, 0, 0, 2, 0, 1));
        } else if (id === 'sphere') {
            handles.push(asmAddon.createSphere(0, 0, 0, 2));
        } else if (id === 'torus') {
            handles.push(asmAddon.createTorus(0, 0, 0, 2, 1));
        } else if (id === 'demo1') {
            handles.push(asmAddon.createBlock(-0.5, 0, -0.5, 0.5, 1, 0.5));
            handles.push(asmAddon.createCylinder(0, 0, 0, 0, 2, 0, 1));
            handles.push(asmAddon.createSphere(0, 0, 0, 2));
            handles.push(asmAddon.createTorus(0, 0, 0, 2, 1));

            xforms.push([1,0,0,0, 0,1,0,0, 0,0,1,0, 2.5,0,0,1]);
            xforms.push([1,0,0,0, 0,1,0,0, 0,0,1,0, -4.5,0,-2.5,1]);
            xforms.push([1,0,0,0, 0,1,0,0, 0,0,1,0, 4.5,0,-3.5,1]);
        }

        if (handles.length > 0) {
            res.write('{"primitives":[');
            for (var i = 0, len = handles.length; i < len; i++) {
                res.write('{"type":"asm","handle":"'+handles[i]+'","xform":['+xforms[i].toString()+'],"data":');
                res.write(asmAddon.jsonGraphicsFromBody(handles[i]));
                res.write('}');
                if (i < handles.length - 1) {
                    res.write(',');
                }
            }
            res.write(']}');
            res.end();
            return;
        }
        break;
        case 'POST':
        break;
        case 'PUT':
        break;
        case 'DELETE':
        break;
    }
    res.end('{}');
};

exports.handleById = function(req, res, method) {
    console.log('handleById[' + req.params.id + ']: ' + method);
    var id = req.params.id;
    switch (method) {
        case 'GET':
        res.write('{"primitives":[{"type":"asm","handle":"'+id+'","data":');
        res.write(asmAddon.jsonGraphicsFromBody(id));
        res.write('}]}');
        res.end();
        return;
        break;
        case 'POST':
        break;
    }
    res.end();
};


if (process.env.LD_LIBRARY_PATH !== undefined) {
    loadAsmAddon();
}
