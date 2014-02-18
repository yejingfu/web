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
    switch (method) {
        case 'GET':
        var handle;
        if (id === 'block') {
            handle = asmAddon.createBlock(-0.5, 0, -0.5, 0.5, 1, 0.5);
        } else if (id === 'cylinder') {
            handle = asmAddon.createCylinder(0, 0, 0, 0, 2, 0, 1);
        } else if (id === 'sphere') {
            handle = asmAddon.createSphere(0, 0, 0, 2);
        } else if (id === 'torus') {
            handle = asmAddon.createTorus(0, 0, 0, 2, 1);
        }

        if (handle !== undefined) {
            res.write('{"primitive":{"type":"asm","handle":"'+handle+'","data":');
            res.write(asmAddon.jsonGraphicsFromBody(handle));
            res.write('}}');
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

loadAsmAddon();