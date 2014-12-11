var scene = null;
var canvasId = '';

var camera = null;
var interactor = null;
var transforms = null;

var useVertexColors = false;
var texture = null;
var texture2 = null;

var c_width = 0;
var c_height = 0;

function initGL() {
    gl.clearColor(0.3,0.3,0.3, 1.0);
    gl.clearDepth(100.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    

    //Creates and sets up the camera location
    camera = new Camera(Camera.CAMERA_ORBITING_TYPE);
    camera.goHome([0,0,4]);
    camera.setFocus([0.0,0.0,0.0]);
    camera.setAzimuth(45);
    camera.setElevation(-30);
    camera.hookRenderer = render;
    
    //Creates and sets up the mouse and keyboard interactor
    interactor = new CameraInteractor(camera, document.getElementById(canvasId));
    
    //Scene Transforms
    transforms = new SceneTransforms(camera);
   
    //init transforms
    transforms.init();
}

function initProgram() {
    attributeList = ["aVertexPosition",
                    "aVertexNormal",
                    "aVertexTangent",
                    "aVertexColor",
                    "aVertexTextureCoords"];

    uniformList = [ "uPMatrix", 
                    "uMVMatrix", 
                    "uNMatrix",
                    "uMaterialDiffuse",
                    "uMaterialAmbient",
                    "uLightAmbient",
                    "uLightDiffuse",
                    "uLightPosition",
                    "uWireframe",
                    "uAlpha",
                    "uUseVertexColor",
                    "uUseLambert",
                    "uSampler",
                    "uNormalSampler"
                    ];
    
    program = Program;
    program.load(attributeList, uniformList, 'shader-vs', 'shader-fs');
    gl.uniform3fv(program.uLightPosition,   [0,5,20]);
    gl.uniform4fv(program.uLightAmbient,    [1.0,1.0,1.0,1.0]);
    gl.uniform4fv(program.uLightDiffuse,    [1.0,1.0,1.0,1.0]);
    gl.uniform1f(program.uAlpha, 1.0);
    gl.uniform1i(program.uUseVertexColor, useVertexColors);
    gl.uniform1i(program.uUseLambert, true);
}

function initTexture() {
    texture = new Texture('textures/fieldstone.jpg');
    texture2 = new Texture('textures/fieldstone-normal.jpg');
}

function loadModel() {
  scene.loadObject('models/geometry/complexCube.json','cube2');
}

function render() {
    gl.viewport(0, 0, c_width, c_height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    transforms.updatePerspective();

    try{
        for (var i = 0; i < scene.objects.length; i++){
            
            var object = scene.objects[i];
            
            if (object.hidden == true) continue;
            
            transforms.calculateModelView();
            transforms.push();
            transforms.setMatrixUniforms();
            transforms.pop();
   
            //Setting uniforms
            gl.uniform4fv(program.uMaterialDiffuse, object.diffuse);
            gl.uniform4fv(program.uMaterialAmbient, object.ambient);

            //Setting attributes
            gl.enableVertexAttribArray(program.aVertexPosition);
            gl.disableVertexAttribArray(program.aVertexNormal);
            gl.disableVertexAttribArray(program.aVertexTangent);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, object.vbo);
            gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(program.aVertexPosition);
            
            if (object.texture_coords){
                gl.enableVertexAttribArray(program.aVertexTextureCoords);
                gl.bindBuffer(gl.ARRAY_BUFFER, object.tbo);
                gl.vertexAttribPointer(program.aVertexTextureCoords, 2, gl.FLOAT, false, 0, 0);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture.tex);
                gl.uniform1i(program.uSampler, 0);
                
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, texture2.tex);
                gl.uniform1i(program.uNormalSampler, 1);
            }
            
            if(!object.wireframe){
                gl.bindBuffer(gl.ARRAY_BUFFER, object.nbo);
                gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(program.aVertexNormal);

                gl.bindBuffer(gl.ARRAY_BUFFER, object.tanbo);
                gl.vertexAttribPointer(program.aVertexTangent, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(program.aVertexTangent);
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

    // 4, init texture
    initTexture();

    // 5, load JSON-formatted data (model) into scene
    loadModel();

    // 6, resize
    $(window).resize(function() {
      resizeCanvas();
    });
    resizeCanvas();

    // 7, render
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



