define(['common', 'threejs', 'signals', 'controls/transformcontrols', 'controls/editorcontrols',
 'libs/ui.threewrapper', 'libs/ui', 'libs/stats'],
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
    this.pointLight = null;
    this.xformControls = null;

    this.geometries = {};  // uuid -- geometry
    this.materials = {}; // uuid -- material

    this.container = null;
    this.info = null;   // display (objects, faces, vertices) at the right bottom
    this.stats = null;  // display performance at the left top
    this.cmdEditor = null;  // commandline editor for command inputing from users

    this.config = new common.Configuration('editor');
    this.config.set('camera', {position: [5.0, 2.5, 5.0], target: [0, 0, 0]});
    this.config.set('grid', {size: 50, step: 2});

    var libSig = signals;
    this.signals = {
        playAnimation: new libSig.Signal(),
        xformModeChanged: new libSig.Signal(),
        rendererChanged: new libSig.Signal(),
        sceneGraphChanged: new libSig.Signal(),
        cameraChanged: new libSig.Signal(),
        auxAdded: new libSig.Signal(),
        auxRemoved: new libSig.Signal(),
        windowResized: new libSig.Signal()
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
    var configCamera = self.config.get('camera');
    self.camera = new THREE.PerspectiveCamera(50, containerDom.offsetWidth/containerDom.offsetHeight, 1, 5000);
    self.camera.position.fromArray(configCamera.position);
    self.camera.lookAt(new THREE.Vector3().fromArray(configCamera.target));
    self.xformControls = new THREE.TransformControls(self.camera, containerDom);
    self.auxScene.add(self.xformControls);
    self.xformControls.addEventListener('change', function() {
        console.log('xformControls.changed');
        //camControls.enable = true;
    });
    var camControls = new THREE.EditorControls(self.camera, containerDom);
    camControls.center.fromArray(configCamera.target);
    camControls.addEventListener('change', function() {
        self.xformControls.update();
    });

    self.pointLight = new THREE.PointLight(0xFFFFFF);
    self.pointLight.position.set(-100, 200, 100);
    self.scene.add(self.pointLight);

    var configGrid = self.config.get('grid');
    var grid = new THREE.GridHelper(configGrid.size, configGrid.step);
    self.auxScene.add(grid);

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
    var onMouseDown = function(e) {
        e.preventDefault();
        var rect = containerDom.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        console.log('onMouseDown:('+x+', ' + y + ')');
    }
    containerDom.addEventListener('mousedown', onMouseDown, false);

    self.signals.sceneGraphChanged.add(function(){
        self.render();
        self.updateInfo();
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
            break;
            case 'tb-primtive-cylinder':
            console.log('cyliner');
            break;
            case 'tb-primtive-sphere':
            console.log('sphere');
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
    debugger;
    var self = this;
    if (!this.cmdEditor) {
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
            if (e.keyCode !== 13) return;
            self.logToCmdLine($('#id_comdline_input').val());
            $('#id_comdline_input').val('');
        });
    }
    this.cmdEditor.toggle('slow');

};

Editor.prototype.logToCmdLine = function(msg) {
    var txt = $('#id_cmdline_log').val();
    $('#id_cmdline_log').val(txt + msg + '\n');
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

    this.showThreeLogo();
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
        this.logo.rotation.x += 0.01;
    }
    //this.logo.rotation.y += 0.01;
    this.scene.updateMatrixWorld();
    this.auxScene.updateMatrixWorld();
    this.renderer.clear();
    this.renderer.render(this.auxScene, this.camera);
    this.renderer.render(this.scene, this.camera);
    this.xformControls.update();
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

/**
Display the THREE logo on the canvas
@method showThreeLogo
@since 1.0.0
**/
Editor.prototype.showThreeLogo = function() {
    var self = this;
    if (!self.logo) {
        var loader = new THREE.JSONLoader();
        loader.load('/static/meshes/treehouse_logo.js', function(geom) {
            var material = new THREE.MeshLambertMaterial({color: 0x55B663});
            self.logo = new THREE.Mesh(geom, material);
            //self.scene.add(self.logo);
            //self.invalidate();
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
    self.signals.sceneGraphChanged.dispatch();
};

Editor.prototype.addGeometry = function(geom) {
    this.geometries[geom.uuid] = geom;
};

Editor.prototype.addMaterial = function(mat) {
    this.materials[mat.uuid] = mat;
};

return {
    create: function(app) {
        return new Editor(app);
    }
};

});
