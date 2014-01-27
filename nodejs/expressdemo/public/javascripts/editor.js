define(['common', 'threejs', 'orbitcontrols'], function(common, threejs, orbitcontrols) {

/**
The 3D modeling editor.
@class Editor
@since 1.0.0
@constructor
**/
var Editor = function(app) {
    common.View.call(this, app);

    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.pointLight = null;
    this.orbitControls = null;

    this.container = null;
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
    self.scene = new THREE.Scene();
    //self.container.css({background:"black"});

    self.renderer = new THREE.WebGLRenderer({antialias:true});
    self.container.append(self.renderer.domElement);
    self.renderer.setClearColor(0x333F47, 1);

    self.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 20000);
    self.camera.position.set(0, 6, 0);
    self.scene.add(self.camera);

    self.resizeGL(window.innerWidth - 80, window.innerHeight - 120);

    self.pointLight = new THREE.PointLight(0xFFFFFF);
    self.pointLight.position.set(-100, 200, 100);
    self.scene.add(self.pointLight);

    // enable pan around with the mouse
    self.orbitControls = new orbitcontrols.OrbitControls(self.camera, self.renderer.domElement);

    window.addEventListener('resize', function() {
        self.resizeGL(window.innerWidth - 80, window.innerHeight - 120);
    });
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

/**
Render the main WebGL rendering area.
@method render
@since 1.0.0
**/
Editor.prototype.invalidate = function() {
    this.renderer.render(this.scene, this.camera);
    this.orbitControls.update();
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