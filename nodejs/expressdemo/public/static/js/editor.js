define(['common', 'threejs', 'signals', 'controls/transformcontrols', 'controls/editorcontrols',
 'lib/ui.threewrapper', 'lib/ui', 'lib/stats'],
     function(common, threejs, signals, transformcontrols, editorcontrols, uithree, ui, stats) {

/**
The 3D modeling editor.
@class Editor
@since 1.0.0
@constructor
**/
var Editor = function(app) {
    common.View.call(this, app);

    this.scene = null;
    this.auxScene = null;
    this.renderer = null;
    this.camera = null;
    this.cameraControls = null;
    this.pointLight = null;
    this.xformControls = null;

    this.geometries = {};  // uuid -- geometry
    this.materials = {}; // uuid -- material

    this.container = null;
    this.info = null;   // display (objects, faces, vertices) at the right bottom
    this.stats = null;  // display performance at the left top
    this.cmdEditor = null;  // commandline editor for command inputing from users
    this.selectionset = []; // the selected objects.
    this.selectionBox = null;  // the selection helper

    this.collabSate = null;  // The state of collaboration document.
    this.collabDeltaState = null;

    this.config = new common.Configuration('editor');
    this.config.set('collaboration', {enabled: true});
    this.config.set('camera', {position: [8.0, 2.5, 8.0], target: [0, 0, 0]});
    this.config.set('grid', {size: 50, step: 2});
    this.config.set('scene', {geomDefColor:0x550055})

    var libSig = signals;
    this.signals = {
        playAnimation: new libSig.Signal(),
        xformModeChanged: new libSig.Signal(),
        rendererChanged: new libSig.Signal(),
        sceneGraphChanged: new libSig.Signal(),
        cameraChanged: new libSig.Signal(),
        auxAdded: new libSig.Signal(),
        auxRemoved: new libSig.Signal(),
        windowResized: new libSig.Signal(),
        objectAdded: new libSig.Signal(),
        objectRemoved: new libSig.Signal(),
        objectSelected: new libSig.Signal(),
        objectChanged: new libSig.Signal()
    };

    this.logo = null;
};

Editor.prototype = new common.View();

/**
Intialize the editor.
@method intialize
**/
Editor.prototype.initialize = function() {
    common.View.prototype.initialize.apply(this, arguments);
    console.log('Editor.initialize');
    this.initGL($('#divEditor'));
    this.bindEvents();
    this.initToolbar();
    if (this.config.get('collaboration').enabled) {
        this.initCollaboration();
    }
};

/**
Initialize WebGL environment.
@method initGL
@since 1.0.0
**/
Editor.prototype.initGL = function(container) {
    var self = this;
    this.container = container;
    var containerDom = this.container[0];
    self.scene = new THREE.Scene();
    self.auxScene = new THREE.Scene();
    //self.container.css({background:"black"});

    self.renderer = new THREE.WebGLRenderer({antialias:true});
    self.container.append(self.renderer.domElement);
    self.renderer.setClearColor(0x333F47, 1);
    self.renderer.autoClear = false;
    self.renderer.autoUpdateScene = false;

    // auxScene contains grid, lights and camera
    // camera
    var configCamera = self.config.get('camera');
    self.camera = new THREE.PerspectiveCamera(50, containerDom.offsetWidth/containerDom.offsetHeight, 1, 5000);
    self.camera.position.fromArray(configCamera.position);
    self.camera.lookAt(new THREE.Vector3().fromArray(configCamera.target));
    self.xformControls = new THREE.TransformControls(self.camera, containerDom);
    //self.xformControls.setSpace('local');   //?
    self.auxScene.add(self.xformControls);
    self.xformControls.addEventListener('change', function() {
        console.log('xformControls changed');
        self.cameraControls.enabled = true;
        if (self.xformControls.axis !== undefined) {
            self.cameraControls.enabled = false;
        } else {
            // todo
        }
        if (self.selectionset.length !== 0) {
            self.signals.objectChanged.dispatch(self.selectionset[self.selectionset.length - 1]);
        }
    });

    // camera controls
    var camControls = new THREE.EditorControls(self.camera, containerDom);
    camControls.center.fromArray(configCamera.target);
    camControls.addEventListener('change', function() {
        console.log('camControls changed');
        self.xformControls.update();
        self.signals.cameraChanged.dispatch(self.camera, self.cameraControls);
    });
    this.cameraControls = camControls;

    self.pointLight = new THREE.PointLight(0xFFFFFF);
    self.pointLight.position.set(-100, 200, 100);
    self.scene.add(self.pointLight);
    self.scene.add(new THREE.AmbientLight(0x222222));

    var configGrid = self.config.get('grid');
    var grid = new THREE.GridHelper(configGrid.size, configGrid.step);
    self.auxScene.add(grid);

    // selection box
    self.selectionBox = new THREE.BoxHelper();
    self.selectionBox.material.depthTest = false;
    self.selectionBox.material.transparent = true;
    self.selectionBox.visible = false;
    self.auxScene.add(self.selectionBox);

    // info text
    var info = new UI.Text();
    info.setPosition('absolute');
    info.setRight('120px');
    info.setBottom('60px');
    info.setColor('#ffffff');
    info.setFontSize('12px');
    info.setValue('info:');
    containerDom.appendChild(info.dom);
    this.info = info;

    // performance panel
    var stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '60px';
    containerDom.appendChild(stats.domElement);
    this.stats = stats;

    window.addEventListener('resize', function() {
        self.resizeGL(window.innerWidth - 80, window.innerHeight - 120);
    });

    self.resizeGL(window.innerWidth - 80, window.innerHeight - 120);
};

/**
Resize the main WebGL rendering area.
@method resizeGL
@since 1.0.0
**/
Editor.prototype.resizeGL = function(w, h) {
    this.container.width(w).height(h);
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
};

Editor.prototype.bindEvents = function() {
    // mouse event
    var self = this;
    var containerDom = self.container[0];

    // picking
    var objects = [];
    var ray = new THREE.Raycaster();
    var projector = new THREE.Projector();
    var getIntersects = function(e, obj) {
        var rc = containerDom.getBoundingClientRect();
        var x = (e.clientX - rc.left) / rc.width;
        var y = (e.clientY - rc.top) / rc.height;
        var vec = new THREE.Vector3(x * 2 - 1, -y * 2 + 1, 0.5);
        projector.unprojectVector(vec, self.camera);
        ray.set(self.camera.position, vec.sub(self.camera.position).normalize());
        if (obj instanceof Array) {
            return ray.intersectObjects(obj);
        } else {
            return ray.intersectObject(obj);
        }
    };

    // mouse events
    var mouseDownPos = new THREE.Vector2();
    var mouseUpPos = new THREE.Vector2();
    var onMouseDown = function(e) {
        e.preventDefault();
        var rect = containerDom.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        console.log('onMouseDown:('+x+', ' + y + ')');
        mouseDownPos.set(x, y);
        document.addEventListener('mouseup', onMouseUp, false);
    };
    var onMouseUp = function(e) {
        var rect = containerDom.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        mouseUpPos.set(x, y);

        if (mouseDownPos.distanceTo(mouseUpPos) === 0) {
            var intersects = getIntersects(e, objects);
            if (intersects.length > 0) {
                var obj = intersects[0].object;
                obj = obj.userData.object || obj;
                if (e.shiftKey) {
                    if (self.findSelection(obj) >= 0) {
                        self.removeSelection(obj);
                    } else {
                        self.addSelection(obj);
                    }
                } else {
                    self.clearSelection();
                    self.addSelection(obj);
                }
            } else {
                self.clearSelection();
            }
            self.render();
        }
        //if (self.selectionset.length !== 0) {
            self.saveCollabDeltaState();
        //}
        document.removeEventListener('mouseup', onMouseUp);
    };
    containerDom.addEventListener('mousedown', onMouseDown, false);

    self.signals.sceneGraphChanged.add(function(){
        self.render();
        self.updateInfo();
    });

    self.signals.objectAdded.add(function(obj) {
        obj.traverse(function(child) {
            objects.push(child);
        });
    });

    self.signals.objectRemoved.add(function(obj) {
        var removeFromObjects = function(child) {
            for (var i = 0, len = objects.length; i < len; i++) {
                if (objects[i] === child) {
                    objects.splice(i, 1);
                    break;
                }
            }
        }
        obj.traverse(function(child) {
            removeFromObjects(child);
        })
        removeFromObjects(obj);
    });

    self.signals.objectSelected.add(function(obj) {
        self.selectionBox.visible = false;
        self.xformControls.detach();
        if (obj) {
            if (obj.geometry !== undefined) {
                self.selectionBox.update(obj);
                self.selectionBox.visible = true;
            }
            if (obj instanceof THREE.PerspectiveCamera === false) {
                self.xformControls.attach(obj);
            }
        }
        self.render();
    });

    self.signals.cameraChanged.add(function(cam, ctrls) {
        self.config.set('camera', {position: cam.position.toArray(), target: ctrls.center.toArray()});
        self.render();
    });

    self.signals.objectChanged.add(function(selectedObj) {
        self.xformControls.update();
        if (selectedObj !== self.camera) {
            if (selectedObj.geometry !== undefined) {
                self.selectionBox.update(selectedObj);
            }
            if (self.auxScene[selectedObj.id] !== undefined) {
                self.auxScene[selectedObj.id].update();
            }
            self.updateInfo();
        }

        self.render();
    });
};

Editor.prototype.initToolbar = function() {
    var self = this;
    $('#toolbar-primtive').toolbar({
        content: '#toolbar-primtive-options',
        position: 'right',
        hideOnClick: true
    }).on('toolbarItemClick', function(e, item){
        switch (item.id) {
            case 'tb-primtive-cube':
            console.log('cube');
            self.exeCommand('get /asmapi/primitives/block');
            break;
            case 'tb-primtive-cylinder':
            console.log('cyliner');
            self.exeCommand('get /asmapi/primitives/cylinder');
            break;
            case 'tb-primtive-sphere':
            console.log('sphere');
            self.exeCommand('get /asmapi/primitives/sphere');
            break;
        }
    });

    $('#toolbar-setting').toolbar({
        content: '#toolbar-setting-options',
        position: 'right',
        hideOnClick: true
    }).on('toolbarItemClick', function(e, item){
        switch (item.id) {
            case 'tb-setting-grid':
            console.log('grid');
            break;
            case 'tb-setting-camera':
            console.log('camera');
            break;
            case 'tb-setting-prefs':
            console.log('preferences');
            break;
        }
    });

    $('#toolbar-commandline').click(function() {
        self.showCommandLine();
    });
};

Editor.prototype.showCommandLine = function() {
    var self = this;
    if (!this.cmdEditor) {
        var cmdStrStack = [];
        var cmdStrStackPos = -1;
        var pos = $('#toolbar').position();
        var top = pos.top + $('#toolbar').height() + 10;
        var left = pos.left + 5;
        var html5 = '<div id=\"id_commandline\" style=\"border:solid 1px;position:absolute;top:'+top+
            'px;left:'+left+'px;width:500px;height:200px;display:none;background-color:rgba(200, 200, 200, 0.8);padding:0px\">'+
            '<textarea id=\"id_cmdline_log\" rows=\"10\" cols=\"20\" readonly=\"readonly\" style=\"width:100%;resize:none;margin:0px;background-color:rgba(200, 200, 200, 0.2)\"></textarea>'+
            '<br>'+
            '<input id=\"id_comdline_input\" name=\"cmdline_input\" type=\"text\" style=\"width:100%;margin:0px;outline:0;border:none;background-color:rgba(200, 200, 200, 0.4)\">'+
            '</div>';
        this.cmdEditor = $(html5);
        this.container.parent().append(this.cmdEditor);
        $('#id_comdline_input').keydown(function(e) {
            if (e.keyCode === 38) { // UP
                if (cmdStrStack.length > 0 && cmdStrStackPos > 0) {
                    cmdStrStackPos --;
                    $('#id_comdline_input').val(cmdStrStack[cmdStrStackPos]);
                }
                return;
            } else if (e.keyCode === 40) { // DOWN
                if (cmdStrStackPos < cmdStrStack.length - 1) {
                    cmdStrStackPos++;
                    $('#id_comdline_input').val(cmdStrStack[cmdStrStackPos]);
                }
                return;
            }
            if (e.keyCode !== 13) return;
            var str = $('#id_comdline_input').val();
            cmdStrStack.push(str);
            cmdStrStackPos = cmdStrStack.length;
            self.exeCommand(str);
            $('#id_comdline_input').val('');
        });
    }
    $('#id_cmdline_log').val('');
    this.cmdEditor.toggle('slow');
};

Editor.prototype.logToCmdLine = function(msg) {
    console.log(msg);
    if ($('#id_cmdline_log').is(':visible')) {
        var txt = $('#id_cmdline_log').val();
        $('#id_cmdline_log').val(txt + msg + '\n');
    }
};

Editor.prototype.exeCommand = function(cmdstr, cb) {
    var self = this;
    if (cmdstr.indexOf('.local ') === 0) {
        // execute local command
        var cmd = cmdstr.slice(7);
        cmd = trim(cmd);
        var cmds = cmd.split(' ');
        if (cmds.length > 0) {
            cmd = trim(cmds[0]);
            var args = [];
            for (var i = 1, len = cmds.length; i < len; i++) {
                args.push(trim(cmds[i]));
            }
            if (this[cmd] !== undefined && typeof this[cmd] === 'function') {
                this[cmd].apply(this, args);
            }
        }
    } else {
        // execute remote command
        var method;
        var path;
        var dataStr = '{}';
        cmdstr = cmdstr.toLowerCase();
        if (cmdstr.indexOf('get ') === 0) method = 'GET';
        else if (cmdstr.indexOf('post ') === 0) method = 'POST';
        else if (cmdstr.indexOf('put ') === 0) method = 'PUT';
        else if (cmdstr.indexOf('delete ') === 0) method = 'DELETE';
        else if (cmdstr.indexOf('head ') === 0) method = 'HEAD';
        if (method === undefined) {
            self.logToCmdLine('[invalid]: ' + cmdstr);
            return;
        }
        path = cmdstr.slice(method.length+1);
        path = trim(path);
        var dataPos = path.indexOf('.data');
        if (dataPos > 0) {
            dataStr = path.slice(dataPos+5);
            dataStr = trim(dataStr).replace(/\'/g, '\"');
            path = trim(path.slice(0, dataPos));
        }
        (function(method, path, dataStr) {
            $.ajax({
                url: path,
                type: method,
                async: true,
                dataType:'json',
                data: JSON.parse(dataStr),
                success: function(data, textStatus, jqXHR) {
                    self.logToCmdLine('[success]:' + method + '-' + path);
                    self.logToCmdLine(JSON.stringify(data));
                    self.loadGeometryFromJSON(data);
                    if (typeof cb === 'function') {
                        cb();
                    }
                },
                error: function(req, st, err) {
                    self.logToCmdLine('[failed]:'+method+'-'+path);
                }
            });
        }(method, path, dataStr));
    }
};

Editor.prototype.initCollaboration = function() {
    var self = this;
    sharejs.open('46a910fc-d481-41e1-b06c-26cb9a9e62c4', 'json', function(err, doc) {
        if (err) console.log('Failed to open share document: ' + err);
        self.collabSate = doc;
        doc.on('change', function(op) {
            console.log('collaboration: on change: ' + JSON.stringify(op));
            self.loadCollabDeltaState(op);
        });
        if (doc.created) {
            // The shared document is created at first time on server side.
            // So here is good place to add initial content into the shared document.
            self.exeCommand('get /asmapi/primitives/demo1', function() {
                self.saveCollabInitState();
            });
        } else {
            // The shared document is already created.
            self.loadCollabState();
        }
    });

    self.signals.objectChanged.add(function(selectedObj) {
        if (selectedObj instanceof THREE.Mesh && selectedObj.asmhandle) {
            var snapshot = self.collabSate.snapshot;
            var found;
            for (var i = 0, len = snapshot.primitives.length; i < len; i++) {
                if (snapshot.primitives[i].asmhandle.toLowerCase() === selectedObj.asmhandle.toLowerCase()) {
                    found = i;
                    break;
                }
            }
            if (found !== undefined) {
                var xform = selectedObj.matrixWorld;
                console.log('xform:'+xform.toArray());
                self.collabDeltaState = {p:['primitives', found, 'xform'], od: null, oi:xform.toArray()};
            }
        }
    });

    self.signals.objectAdded.add(function(obj) {
        if (obj instanceof THREE.Mesh && obj.asmhandle && self.collabSate.snapshot) {
            var snapshot = self.collabSate.snapshot;
            var found;
            for (var i = 0, len = snapshot.primitives.length; i < len; i++) {
                if (snapshot.primitives[i].asmhandle.toLowerCase() === obj.asmhandle.toLowerCase()) {
                    found = i;
                    break;
                }
            }
            if (found === undefined) {
                var newPrimitive = {asmhandle:obj.asmhandle, xform:obj.matrix.toArray()};
                self.collabDeltaState = {p:['primitives', len], li:newPrimitive};
                self.saveCollabDeltaState();
            }
        }
    });

    self.signals.objectRemoved.add(function(obj) {
        if (obj instanceof THREE.Mesh && obj.asmhandle && self.collabSate.snapshot) {
            var snapshot = self.collabSate.snapshot;
            var found;
            for (var i = 0, len = snapshot.primitives.length; i < len; i++) {
                if (snapshot.primitives[i].asmhandle.toLowerCase() === obj.asmhandle.toLowerCase()) {
                    found = i;
                    break;
                }
            }
            if (found !== undefined) {
                var primitiveToRemove = {asmhandle:obj.asmhandle, xform:obj.matrix.toArray()};
                self.collabDeltaState = {p:['primitives', found], ld:primitiveToRemove};
                self.saveCollabDeltaState();
            }
        }
    });
};

Editor.prototype.saveCollabInitState = function() {
    // collect the primitive meta data and save into sharejs server.
    var self = this;
    var primitivesState = {primitives:[]};
    self.scene.traverse(function(obj) {
        if (obj instanceof THREE.Mesh && obj.asmhandle !== undefined) {
            primitivesState.primitives.push({asmhandle: obj.asmhandle, xform: obj.matrix.toArray()});
        }
    });
    self.collabSate.submitOp([{p: [], od: null, oi: primitivesState}]);
};

Editor.prototype.loadCollabState = function() {
    var self = this;
    var primitives = self.collabSate.snapshot.primitives;
    if (primitives) {
        for (var i = 0, len = primitives.length; i < len; i++) {
            (function(primitive){
                self.exeCommand('get /asmapi/graphics/handle/'+primitive.asmhandle, function() {
                    var meshObj = self.getAsmObject(primitive.asmhandle);
                    if (meshObj && primitive.xform) {
                        var xform = new THREE.Matrix4().fromArray(primitive.xform);
                        meshObj.applyMatrix(xform);
                    }
                });
            })(primitives[i]);
        }
    } else {
        console.log('Cannot get primitives state from sharejs');
    }
};

Editor.prototype.saveCollabDeltaState = function() {
    var self = this;
    if (self.collabSate && self.collabDeltaState) {
        self.collabSate.submitOp([self.collabDeltaState]);
        self.collabDeltaState = undefined;
    }
};

Editor.prototype.loadCollabDeltaState = function(op) {
    var self = this;
    if (op === undefined || op.length === 0) {
        return;
    }
    var snapshot = self.collabSate.snapshot;
    for ( var i = 0, len = op.length; i < len; i++) {
        if (op[i].p.length === 2) {
            // add a new primitive
            var newPrimitive = op[i].li;
            var delPrimitive = op[i].ld;
            if (newPrimitive) {
                var meshObj = self.getAsmObject(newPrimitive.asmhandle);
                if (meshObj) {
                    var xform = new THREE.Matrix4().fromArray(newPrimitive.xform);
                    meshObj.applyMatrix(xform);
                } else {
                    self.exeCommand('get /asmapi/graphics/handle/'+newPrimitive.asmhandle, function() {
                        meshObj = self.getAsmObject(newPrimitive.asmhandle);
                        if (meshObj) {
                            var xform = new THREE.Matrix4().fromArray(newPrimitive.xform);
                            meshObj.applyMatrix(xform);
                        }
                    });
                }
            } else if (delPrimitive) {
                var meshObj = self.getAsmObject(delPrimitive.asmhandle);
                if (meshObj) {
                    // remove this object from scene
                    self.removeObject(meshObj);
                }
            }
        } else if (op[i].p.length === 3) {
            // modify xform
            var curObj = snapshot[op[i].p[0]][op[i].p[1]];
            if (curObj && op[i].p[2] === 'xform') {
                var curMesh = self.getAsmObject(curObj.asmhandle);
                if (curMesh && op[i].oi) {
                    var xform = new THREE.Matrix4().fromArray(op[i].oi);
                    curMesh.matrix.identity();
                    curMesh.applyMatrix(xform);
                }
            }
        }
    }
};

/**
Launch the editor.
@method show
**/
Editor.prototype.show = function() {
    common.View.prototype.show.apply(this, arguments);
    console.log('Editor.show()');

    var self = this;
    var animation = function() {
        requestAnimationFrame(animation);
        self.invalidate();
        self.stats.update();
    }

    //this.loadThreeLogo();
    animation();
};


Editor.prototype.invalidate = function() {
    this.render();
};

/**
Render the main WebGL rendering area.
@method render
@since 1.0.0
**/
Editor.prototype.render = function() {
    if (this.logo) {
        //this.logo.rotation.x += 0.01;
    }
    // Should render auxscene, otherwise the selectionBox would display behind the scene objects.
    this.scene.updateMatrixWorld();
    this.auxScene.updateMatrixWorld();
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.renderer.render(this.auxScene, this.camera);
    //this.xformControls.update();
};

Editor.prototype.updateInfo = function() {
    var numObjs = 0;
    var numFaces = 0;
    var numVertices = 0;
    this.scene.traverse(function(obj) {
        if (obj instanceof THREE.Mesh) {
            numObjs ++;
            var geom = obj.geometry;
            if (geom instanceof THREE.Geometry) {
                numVertices += geom.vertices.length;
                numFaces += geom.faces.length;
            } else if (geom instanceof THREE.BufferGeometry) {
                numVertices += geom.attributes.position.array.length / 3;
                if (geom.attributes.index !== undefined) {
                    numFaces += geom.attributes.index.array.length / 3;
                } else {
                    numFaces += geom.attributes.position.array.length / 9;
                }
            }
        }
    });
    this.info.setValue('objects: ' + numObjs + ', faces: ' + numFaces + ', vertices: ' + numVertices);
};

Editor.prototype.loadGeometryFromJSON = function(data) {
    if (!data) return;
    var appendIfNotExist = function(arr, el) {
        for (var i = 0, len = arr.length; i < len; i++) {
            if (Math.abs(arr[i].x - el.x) < 1e-6 && Math.abs(arr[i].y - el.y) < 1e-6 && Math.abs(arr[i].z - el.z) < 1e-6) {
                return i;
            }
        }
        arr.push(el);
        return i;
    };

    for (var primitiveIdx = 0, primitiveLen = (data.primitives ? data.primitives.length : 0); primitiveIdx < primitiveLen; primitiveIdx++) {
        var primitive = data.primitives[primitiveIdx];
        if (primitive.type === 'asm') {
            var asmData = primitive.data;
            geom = new THREE.Geometry();
            geom.name = primitive.handle;
            var faces = asmData.faces.create;
            var face;
            var faceVetexIdx;
            var idx;
            var normals;
            if (faces instanceof Array) {
                for (var i = 0, len = faces.length; i < len; i++) {
                    face = faces[i];
                    console.assert(face.type === 'Mesh');
                    faceVetexIdx = [];
                    for (var j = 0, len2 = face.pos.length; j < len2; j+=3) {
                        idx = appendIfNotExist(geom.vertices, new THREE.Vector3(face.pos[j], face.pos[j+1], face.pos[j+2]));
                        faceVetexIdx.push(idx);
                    }
                    for (var j = 0, len2 = face.prim.length; j < len2; j+=3) {
                        normals = [];
                        idx = face.prim[j] * 3;
                        normals.push(new THREE.Vector3(face.norm[idx], face.norm[idx + 1], face.norm[idx+2]));
                        idx = face.prim[j+1] * 3;
                        normals.push(new THREE.Vector3(face.norm[idx], face.norm[idx + 1], face.norm[idx+2]));
                        idx = face.prim[j+2] * 3;
                        normals.push(new THREE.Vector3(face.norm[idx], face.norm[idx + 1], face.norm[idx+2]));
                        geom.faces.push(new THREE.Face3(faceVetexIdx[face.prim[j]], faceVetexIdx[face.prim[j+1]], faceVetexIdx[face.prim[j+2]], normals));
                    }
                }
            }
            //geom.computeFaceNormals();
            geom.computeBoundingSphere();
            var material = new THREE.MeshLambertMaterial({color:this.config.get('scene').geomDefColor});
            var mesh = new THREE.Mesh(geom, material);
            mesh.asmhandle = geom.name;
            if (primitive.xform) {
                var xform = new THREE.Matrix4().fromArray(primitive.xform);
                mesh.applyMatrix(xform);
            }
            this.addObject(mesh);
        }
    }
};

Editor.prototype.getAsmObject = function(handle) {
    var self = this;
    var result;
    self.scene.traverse(function(obj) {
        if (result === undefined && obj instanceof THREE.Mesh && obj.asmhandle.toLowerCase() === handle.toLowerCase()) {
            result = obj;
        }
    });
    return result;
};

/**
Display the THREE logo on the canvas
@method loadThreeLogo
@since 1.0.0
**/
Editor.prototype.loadThreeLogo = function() {
    var self = this;
    if (!self.logo) {
        var loader = new THREE.JSONLoader();
        loader.load('/static/meshes/treehouse_logo.js', function(geom) {
            for (var i = 0, len = geom.vertices.length; i < len; i++) {
                geom.vertices[i].y -= 0.88;
            }
            var material = new THREE.MeshLambertMaterial({color: 0x55B663});
            self.logo = new THREE.Mesh(geom, material);
            self.addObject(self.logo);
        });
    } else {
        self.invalidate();
    }
};

Editor.prototype.addObject = function(obj) {
    var self = this;
    obj.traverse(function(child) {
        if (child.geometry !== undefined) self.addGeometry(child.geometry);
        if (child.material !== undefined) self.addMaterial(child.material);
    });
    self.scene.add(obj);
    self.signals.objectAdded.dispatch(obj);
    self.signals.sceneGraphChanged.dispatch();
};

Editor.prototype.removeObject = function(obj) {
    var self = this;
    if (obj !== undefined) {
        obj.parent.remove(obj);
        self.signals.objectRemoved.dispatch(obj);
    }
};

Editor.prototype.addSelection = function(obj) {
    this.selectionset.push(obj);
    this.signals.objectSelected.dispatch(obj);
};

Editor.prototype.removeSelection = function(obj) {
    for (var i = 0, len = this.selectionset.length; i < len; i++) {
        if (this.selectionset[i] === obj) {
            this.selectionset.splice(i, 1);
            break;
        }
    }
    var last = this.selectionset.length > 0 ? this.selectionset[this.selectionset.length - 1] : null;
    this.signals.objectSelected.dispatch(last);
};

Editor.prototype.clearSelection = function() {
    this.selectionset = [];
    this.signals.objectSelected.dispatch(null);
};

Editor.prototype.findSelection = function(obj) {
    var idx = -1;
    for (var i = 0, len = this.selectionset.length; i < len; i++) {
        if (this.selectionset[i] === obj) {
            idx = i;
            break;
        }
    }
    return idx;
};

Editor.prototype.deleteSelection = function() {
    var asmObjHandles = [];
    for (var i = 0, len = this.selectionset.length; i < len; i ++) {
        if (this.selectionset[i].asmhandle !== undefined) {
            asmObjHandles.push(this.selectionset[i].asmhandle);
        }
    }
    var self = this;
    if (asmObjHandles.length === 0) return;
    $.ajax({
        url: '/asmapi/graphics/handle/' + asmObjHandles.join(','),
        type: 'DELETE',
        async: true,
        success: function(data, textStatus, jqXHR) {
            self.logToCmdLine('[success]: deleteSelection: ' + asmObjHandles);
            self.removeSelectionFromScene();
        },
        error: function(req, st, err) {
            self.logToCmdLine('[failed]: deleteSelection: '+ asmObjHandles);
        }
    });
};

Editor.prototype.doBoolean = function(btype) {
    if (btype !== 'union' && btype !== 'subtract' && btype !== 'intersect') {
        console.error('The boolean type is not correct');
        return;
    }
    if (this.selectionset.length < 2) {
        console.error('More than one objects should be selected for boolean');
        return;
    }
    var blank = {
        handle: this.selectionset[0].asmhandle,
        xform: this.selectionset[0].matrix.toArray()
    };
    var tools = [];
    for (var i = 1, len = this.selectionset.length; i < len; i++) {
        if (this.selectionset[i].asmhandle !== undefined) {
            tools.push({
                handle: this.selectionset[i].asmhandle,
                xform: this.selectionset[i].matrix.toArray()
            });
        }
    }
    if (blank.handle === undefined || tools.length === 0) {
        console.error('The objects for boolean is not right');
        return;
    }
    var self = this;
    $.ajax({
        url: '/asmapi/graphics/boolean',
        type: 'PUT',
        async: true,
        dataType: 'json',
        data: {
            type: btype,
            tools: tools,
            blank: blank
        },
        success: function(data, st, jqXHR) {
            self.removeSelectionFromScene();
            self.loadGeometryFromJSON(data);
        },
        error: function(req, st, err) {
            self.logToCmdLine('[failed]: doBoolean: '+ err);
        }
    });
};

Editor.prototype.removeSelectionFromScene = function() {
    for (var i = 0, len = this.selectionset.length; i < len; i ++) {
        this.removeObject(this.selectionset[i]);
    }
    this.clearSelection();
};

Editor.prototype.addGeometry = function(geom) {
    this.geometries[geom.uuid] = geom;
};

Editor.prototype.addMaterial = function(mat) {
    this.materials[mat.uuid] = mat;
};

Editor.prototype.setTransformMode = function(mode) {
    if (mode === 'translate' || mode === 'rotate' || mode === 'scale') {
        this.xformControls.setMode(mode);
    }
};

function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
};

return {
    create: function(app) {
        return new Editor(app);
    }
};

});
