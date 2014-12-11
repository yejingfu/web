var camera = null,
scene = null,
gl = null,
program = null,    // The program (shaders)
canvasId = '',
c_width = 0,
c_height = 0,
renderTimerId = -1,

transforms = null,

// Camera settings
cameraHome = [0.0,10,150],
cameraAzimuth = 25,
cameraElevation = -11,

floorVisible = false,
translateLights = false;


function initGL(){
    gl.clearColor(0.2,0.2,0.2, 1.0);
    gl.clearDepth(1.0);
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); 

    
  
    //Creates and sets up the camera location
    camera = new Camera(Camera.CAMERA_ORBITING_TYPE);
    camera.goHome(cameraHome);
    camera.setFocus([0.0,0.0,0.0]);
	camera.setAzimuth(cameraAzimuth);
	camera.setElevation(cameraElevation);
    camera.hookRenderer = render;
    
    //Creates and sets up the mouse and keyboard interactor
    var interactor = new CameraInteractor(camera, document.getElementById(canvasId));
    
    //Scene Transforms
    transforms = new SceneTransforms(camera);
   
    //init transforms
    transforms.init();


    // init lights
    Utils.addLight('far-left', [-25,25,-25], [0.0,0.0,0.0], [0.5,0.5,0.5], [0.4,0.4,0.4]);
    Utils.addLight('far-right', [25,25,-25], [0.0,0.0,0.0], [0.5,0.5,0.5], [0.4,0.4,0.4]);
    Utils.addLight('near-left', [-25,25,25], [0.0,0.0,0.0], [0.5,0.5,0.5], [0.4,0.4,0.4]);
    Utils.addLight('near-right', [25,25,25], [0.0,0.0,0.0], [0.5,0.5,0.5], [0.4,0.4,0.4]);
}

function initProgram() {

	var attributeList = ["aVertexPosition",
					"aVertexNormal",
					"aVertexColor"];

	var uniformList = [	"uPMatrix", 
					"uMVMatrix", 
					"uNMatrix",
                    "uLightPosition",
                    "uWireframe",
                    "uLa",
                    "uLd",
                    "uLs",
                    "uKa",
                    "uKd",
                    "uKs",
                    "uNs",
                    "d",
                    "illum",
                    "uTranslateLights"
					];
	
    program = Program;
	program.load(attributeList, uniformList, 'shader-vs-2', 'shader-fs-2');
	

    gl.uniform3fv(program.uLightPosition, Utils.getLightArray('position'));
    gl.uniform3fv(program.uLa ,     Utils.getLightArray('ambient'));
    gl.uniform3fv(program.uLd,      Utils.getLightArray('diffuse'));
    gl.uniform3fv(program.uLs,      Utils.getLightArray('specular'));
    
    gl.uniform3fv(program.uKa ,     [1.0,1.0,1.0]);
    gl.uniform3fv(program.uKd ,     [1.0,1.0,1.0]);
    gl.uniform3fv(program.uKs ,     [1.0,1.0,1.0]);
    
    gl.uniform1f(program.uNs, 1.0);
    gl.uniform1i(program.uTranslateLights, translateLights);

}

function loadModel() {
  var thefloor = createFloor(80, 2);
  thefloor.Ka = [1,1,1];
  thefloor.Kd = [0.6,0.6,0.6]
  thefloor.Ks = [1,1,1];
  thefloor.Ni = 1;
  thefloor.Ns = 1;
  thefloor.d = 1.0;
  thefloor.illum = 1;   
  thefloor.visible = true;//floorVisible;

  scene.addObject(thefloor);

  // load car model(JSON data) 
  //for(var i = 1; i <= 178; i+=1){
  //  scene.loadObject('models/nissan/part'+i+'.json');
  //}

  // load simple box
  scene.loadObject('models/geometry/simpleCube.json');
  //scene.loadObject('models/nissan/part1.json');
}


function render() {
    gl.viewport(0, 0, c_width, c_height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    

    transforms.updatePerspective();
    
    try{
        
        for (var i = 0; i < scene.objects.length; i++){
            
            var object = scene.objects[i];
			if (object.visible != undefined && !object.visible) continue;
			transforms.calculateModelView();           
            transforms.push();
            transforms.setMatrixUniforms();
            transforms.pop();
            
            
   
            gl.enableVertexAttribArray(program.aVertexPosition);
            gl.disableVertexAttribArray(program.aVertexNormal);
            gl.disableVertexAttribArray(program.aVertexColor);
            
            gl.uniform1i(program.uWireframe, false);
            gl.uniform3fv(program.uKa, object.Ka);
            gl.uniform3fv(program.uKd, object.Kd);
            gl.uniform3fv(program.uKs, object.Ks);
            gl.uniform1f(program.uNs, object.Ns);
            gl.uniform1f(program.d, object.d);
            gl.uniform1i(program.illum, object.illum);
            

            gl.bindBuffer(gl.ARRAY_BUFFER, object.vbo);
            gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(program.aVertexPosition);
            
			if(!object.wireframe){
				gl.bindBuffer(gl.ARRAY_BUFFER, object.nbo);
				gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(program.aVertexNormal);
            }
            else{
                gl.uniform1i(program.uWireframe, true);
            }
			
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);
			
			if (object.wireframe){
                gl.drawElements(gl.LINES, object.indices.length, gl.UNSIGNED_SHORT,0);
            }
            else{
                gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT,0);
            }
			
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        }
    }
    catch(err){
        alert(err);
        console.error(err.description);
    }
}

function initApplication(id) {
    canvasId = id;
    scene = new Scene();

    // 1, get WebGL context
    gl = Utils.getGLContext(canvasId);

    // 2, WebGL initialize
    initGL();

    // 3, init program(shaders)
    initProgram();

    // 4, load JSON-formatted data (model) into scene
    loadModel();

    // 5, render
    // requestAnimFrame(render);   // 60 fps
    // or:
    var renderLoop = function() {
      renderTimerId = setInterval(render, 500);
    };
    window.onblur = function(){
      clearInterval(renderTimerId);
      console.info('Rendering stopped');
    };
    window.onfocus = function(){
      renderLoop();
      console.info('Rendering resumed');
    };
    renderLoop();
}

function resizeCanvas() {
    c_width = $(window).width();
    c_height = $(window).height();
    $('#'+canvasId).attr('width',c_width);
    $('#'+canvasId).attr('height',c_height);
}


function refreshCanvas() {
  render();
}

function createFloor(d, e) {

  var theFloor = {
    alias       : 'floor',
    wireframe   : true,
    dim         : 50,
    lines       : 50,
    vertices    : [],
    indices     : [],
    diffuse : [0.7,0.7,0.7,1.0]
  };


  if (d) theFloor.dim = d;
  if (e) theFloor.lines = 2*theFloor.dim/e;
  var inc = 2*theFloor.dim/theFloor.lines;
  var v = [];
  var i = [];

  for(var l=0;l<=theFloor.lines;l++){
    v[6*l] = -theFloor.dim; 
    v[6*l+1] = 0;
    v[6*l+2] = -theFloor.dim+(l*inc);
                        
    v[6*l+3] = theFloor.dim;
    v[6*l+4] = 0;
    v[6*l+5] = -theFloor.dim+(l*inc);
                        
    v[6*(theFloor.lines+1)+6*l] = -theFloor.dim+(l*inc); 
    v[6*(theFloor.lines+1)+6*l+1] = 0;
    v[6*(theFloor.lines+1)+6*l+2] = -theFloor.dim;
                        
    v[6*(theFloor.lines+1)+6*l+3] = -theFloor.dim+(l*inc);
    v[6*(theFloor.lines+1)+6*l+4] = 0;
    v[6*(theFloor.lines+1)+6*l+5] = theFloor.dim;
                        
    i[2*l] = 2*l;
    i[2*l+1] = 2*l+1;
    i[2*(theFloor.lines+1)+2*l] = 2*(theFloor.lines+1)+2*l;
    i[2*(theFloor.lines+1)+2*l+1] = 2*(theFloor.lines+1)+2*l+1;        
  }
  theFloor.vertices = v;
  theFloor.indices = i;
  
  return theFloor;
}


