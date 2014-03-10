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

var identifyMatStr = '[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]';

var graphicsFromHandleId = function(handleId, xformStr) {
    xformStr = xformStr || identifyMatStr;
    var result = '{"primitives":[{"type":"asm","handle":"'+handleId+'","xform":'+xformStr+',"data":';
    result += asmAddon.jsonGraphicsFromBody(handleId);
    result += '}]}';
    return result;
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

exports.graphicsFromHandleId = function(req, res, method) {
    console.log('graphicsFromHandleId[' + req.params.id + ']: ' + method);
    var id = req.params.id;
    switch (method) {
        case 'GET':
        res.end(graphicsFromHandleId(id));
        return;
        break;
        case 'POST':
        break;
        case 'DELETE':
        var bodies = '["'+id+'"]';
        var ret = asmAddon.deleteBodies(bodies);
        console.log('deleteBodies:'+ret);
        res.end();
        return;
    }
    res.end();
};

exports.graphicsFromBoolean = function(req, res, method) {
    console.log('graphicsFromBoolean');
    /**
    params: {
        type: 'union|subtract|intersect',
        tools: [
            {handle: 'handle1', xform: 'matrix4'},
            {handle: 'handle2', xform: 'matrix4'}
        ],
        blank: {handle: 'resultHandle', xform: 'matrix4'}
    }
     The tool handles would be applied into the blank handle.
     And the blank is returned.
    */
    var params = req.body;
    if (method === 'PUT') {
        console.log('boolean:'+ JSON.stringify(req.body));
        var type = params.type;
        var tools = params.tools;
        var blank = params.blank;
        var result;
        var func;
        var bodiesToRemove = [];
        if (type === 'union') func = asmAddon.bodyUnion;
        else if (type === 'subtract') func = asmAddon.bodySubtract;
        else if (type === 'intersect') func = asmAddon.bodyIntersect;
        if (tools.length > 0 && blank !== undefined && func) {
            result = {};
            result.handle = asmAddon.copyEntity(blank.handle);
            bodiesToRemove.push(blank.handle);
            console.assert(result.handle !== undefined && result.handle !== '');
            asmAddon.transformBody(result.handle, '['+blank.xform.join(',')+']');
            for (var i = 0, len = tools.length; i < len; i++) {
                var tmpHanle = tools[i].handle;
                bodiesToRemove.push(tmpHanle);
                asmAddon.transformBody(tmpHanle, '[' + tools[i].xform.join(',')+']');
                func(tmpHanle, result.handle);
            }
        }
        if (bodiesToRemove.length > 0) {
            asmAddon.deleteBodies('[' + bodiesToRemove.join(',') + ']'); //(JSON.stringify(bodiesToRemove));
        }
        if (result !== undefined) {
            res.end(graphicsFromHandleId(result.handle));
            return;
        } else {
            console.error('Failed on boolean operation.');
        }
    }
    res.end();
};


if (process.env.LD_LIBRARY_PATH !== undefined) {
    loadAsmAddon();
}
