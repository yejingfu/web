angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://pbs.twimg.com/profile_images/479740132258361344/KaYdH9hE.jpeg'
  }, {
    id: 2,
    name: 'Andrew Jostlin',
    lastText: 'Did you get the ice cream?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  }
})

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  // Some fake testing data
  var friends = [{
    id: 0,
    name: 'Ben Sparrow',
    notes: 'Enjoys drawing things',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    notes: 'Odd obsession with everything',
    face: 'https://pbs.twimg.com/profile_images/479740132258361344/KaYdH9hE.jpeg'
  }, {
    id: 2,
    name: 'Andrew Jostlen',
    notes: 'Wears a sweet leather Jacket. I\'m a bit jealous',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    notes: 'I think he needs to buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    notes: 'Just the nicest guy',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];


  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  }
})

.factory('Cube', function($http) {

var camera = null;
var scene = null;
var gl = null;
var program = null;    // The program (shaders)
var canvasId = '';
var renderTimerId = -1;

// Camera settings
var cameraHome = [0.0,10,150];
var cameraAzimuth = 25;
var cameraElevation = -11;

var floorVisible = false;
var translateLights = false;

var interactor = null;
var transforms = null;

var useVertexColors = false;
var texture = null;
var texture2 = null;

var c_width = 0;
var c_height = 0;

function initGL(gl_) {
    gl = gl_;
    gl.clearColor(1.0,0.3,0.3, 1.0);
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
    transforms = new SceneTransforms(gl, camera);
   
    //init transforms
    transforms.init();
}

function initProgram() {
    var attributeList = ["aVertexPosition",
                    "aVertexNormal",
                    "aVertexTangent",
                    "aVertexColor",
                    "aVertexTextureCoords"];

    var uniformList = [ "uPMatrix", 
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
    program.load(gl, attributeList, uniformList, 'shader-vs', 'shader-fs');
    gl.uniform3fv(program.uLightPosition,   [0,5,20]);
    gl.uniform4fv(program.uLightAmbient,    [1.0,1.0,1.0,1.0]);
    gl.uniform4fv(program.uLightDiffuse,    [1.0,1.0,1.0,1.0]);
    gl.uniform1f(program.uAlpha, 1.0);
    gl.uniform1i(program.uUseVertexColor, useVertexColors);
    gl.uniform1i(program.uUseLambert, true);
}

function initTexture() {
    debugger;
    texture = new Texture(gl, '/android_asset/www/lib/textures/fieldstone.jpg');
    texture2 = new Texture(gl, '/android_asset/www/lib/textures/fieldstone-normal.jpg');
    //texture = new Texture(gl, 'lib/textures/fieldstone.jpg');
    //texture2 = new Texture(gl, 'lib/textures/fieldstone-normal.jpg');
}

function loadModel() {

  var url = '/android_asset/www/lib/complexCube.json';
  $http.get(url).success(function(response){

    //debugger;
    //alert('json:' + response);
    //for (var k in response) {
    //  alert('k:' + k);
    //}

  //  var o = JSON.parse(response);
    var o = response;
    if (alias == null && o.alias == null){
      o.alias = 'cube2';
    }
    o.remote = false;
    scene.addObject(o);
  });


  //scene.loadObject('lib/complexCube.json','cube2');
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


function initialize(id) {
    canvasId = id;

    // 1, get WebGL context
    var gl_ = Utils.getGLContext(canvasId);
    c_width = jQuery('#showcaseview').width(); //480;
    c_height = jQuery('#showcaseview').height(); // 400
    jQuery('#cube-canvas').attr('width',c_width);
    jQuery('#cube-canvas').attr('height',c_height);

    scene = new Scene(gl_);

    // 2, WebGL initialize
    initGL(gl_);

    // 3, init program(shaders)
    initProgram();

    // 4, init texture
    initTexture();

    // 5, load JSON-formatted data (model) into scene
    loadModel();

    // 6, resize
    //$(window).resize(function() {
    //  resizeCanvas();
    //});
    //resizeCanvas();

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
    return gl_;
}

return {
  initialize: function(id) {
    return initialize(id);
  }
}

})

;

