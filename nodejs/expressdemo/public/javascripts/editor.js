define(['common', 'threejs', 'signals', 'controls/transformcontrols', 'controls/editorcontrols', 'libs/ui.threewrapper'],
     function(common, threejs, signals, transformcontrols, editorcontrols, uithree) {

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

    this.container = null;

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
    }

    this.showThreeLogo();
    animation();
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
    this.scene.updateMatrixWorld();
    this.auxScene.updateMatrixWorld();
    this.renderer.clear();
    this.renderer.render(this.auxScene, this.camera);
    this.renderer.render(this.scene, this.camera);
    this.xformControls.update();
};

/**
Display the THREE logo on the canvas
@method showThreeLogo
@since 1.0.0
**/
Editor.prototype.showThreeLogo = function() {
    var self = this;
    var loader = new THREE.JSONLoader();
    loader.load('/meshes/treehouse_logo.js', function(geom) {
        var material = new THREE.MeshLambertMaterial({color: 0x55B663});
        var mesh = new THREE.Mesh(geom, material);
        self.scene.add(mesh);
        self.invalidate();
    });
};

return {
    create: function(app) {
        return new Editor(app);
    }
};

});
