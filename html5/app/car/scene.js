window.Scene = function() {
  this.objects = [];
};

Scene.prototype = {

    getObject : function(alias){
        for(var i=0, max = this.objects.length; i < max; i++){
            if (alias == this.objects[i].alias) return this.objects[i];
        }
        return null;
    },

    loadObject : function(filename,alias,attributes,callback){
        var request = new XMLHttpRequest();
        console.info('Requesting ' + filename);
        request.open("GET",filename);
        var self = this;
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if(request.status == 404) {
                    console.info(filename + ' does not exist');
                }
                else {
                    var o = JSON.parse(request.responseText);
                    if (alias == null && o.alias == null){
                        o.alias = 'undefined'
                    }
                    o.remote = true;
                    self.addObject(o,attributes,callback);
                }
            }
        }
        request.send();
    },
    
    loadObjectByParts: function(path, alias, parts){
        for(var i = 1;i <= parts; i++){
            var partFilename =  path+''+i+'.json';
            var partAlias = alias+''+i;
            self.loadObject(partFilename,partAlias);
        }
    },
    
    addObject : function(object,attributes,callback) {
        
        //initialize with defaults
        if (object.wireframe        === undefined)    {   object.wireframe        = false;            }
        if (object.diffuse          === undefined)    {   object.diffuse          = [1.0,1.0,1.0,1.0];}
        if (object.ambient          === undefined)    {   object.ambient          = [0.2,0.2,0.2,1.0];}
        if (object.specular         === undefined)    {   object.specular         = [1.0,1.0,1.0,1.0];}
        
        //set attributes
       for(var key in attributes){
            //if(object.hasOwnProperty(key)) {
			object[key] = attributes[key];
			//}
        }   

        // vertex position 
        var vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertices), gl.STATIC_DRAW);

        // vertex normal (used for shading)          
        var normalBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Utils.calculateNormals(object.vertices, object.indices)), gl.STATIC_DRAW);
    
       // vertex color
       var colorBufferObject;
       if (object.scalars){
            colorBufferObject = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.scalars), gl.STATIC_DRAW);
            object.cbo = colorBufferObject;
        }
		
        // vertex texture coord (UV, ST)
		var textureBufferObject, tangentBufferObject;
		if (object.texture_coords){
			console.info('the object '+object.name+' has texture coordinates');
			textureBufferObject = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, textureBufferObject);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.texture_coords), gl.STATIC_DRAW);
			object.tbo = textureBufferObject;

            tangentBufferObject = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, tangentBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Utils.calculateTangents(object.vertices, object.texture_coords, object.indices)), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER,null);
            object.tanbo = tangentBufferObject;
		}
        
        // texture
        if (object.image){
            object.texture = new Texture(object.image);
        }
    
        // index buffer
        var indexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.indices), gl.STATIC_DRAW);
        
        object.vbo = vertexBufferObject;
        object.ibo = indexBufferObject;
        object.nbo = normalBufferObject;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
    
        this.objects.push(object);
        
        if (object.remote){
            console.info(object.alias + ' has been added to the scene [Remote]');
         }
         else {
            console.info(object.alias + ' has been added to the scene [Local]');
         }
		 
		 if (callback != undefined){
			callback(object);
		 }
    },
	
	
	removeObject: function(objectName){
		var o = this.getObject(objectName);
		var idx = this.objects.indexOf(o);
		this.objects.splice(idx,1);
	},
	
	renderFirst: function(objectName){
		var o = this.getObject(objectName);
		var idx = this.objects.indexOf(o);
		if (idx == 0) return; 
		this.objects.splice(idx, 1);
		this.objects.splice(0,0,o);
		console.info('render order:' + this.renderOrder());
	},
	
	renderLast: function(objectName){
		var o = this.getObject(objectName);
		var idx = this.objects.indexOf(o);
		if (idx == 0) return; 
		this.objects.splice(idx, 1);
		this.objects.push(o);
		console.info('render order:' + this.renderOrder());
	},
	
	renderSooner : function(objectName){
		var o = this.getObject(objectName);
		var idx = this.objects.indexOf(o);
		if (idx == 0) return; //can't bring it forward further than to the first place
		this.objects.splice(idx,1);
		this.objects.splice(idx-1,0,o);
		console.info('render order:' + this.renderOrder());
	},
	
	renderLater: function(objectName){
		var o = this.getObject(objectName);
		var idx = this.objects.indexOf(o);
		if (idx == this.objects.length-1) return; //can't send it back further than to the last place
		this.objects.splice(idx,1);
		this.objects.splice(idx+1,0,o);
		console.info('render order:' + this.renderOrder());
	},
	
	renderOrder: function(){
		var s = '[ ';
		for(var i =0, max=this.objects.length; i< max; i++){
			s += this.objects[i].alias + ' ';
		}
		s += ']';
		return s;
	}
};


///////////////////////////////////////////////////////////
// Scene transform (model-view matrix, project matrix, ...)
////////////////////////////////////////////////////////////

window.SceneTransforms = function(c){
	this.stack = [];
	this.camera = c;
	this.mvMatrix    = mat4.create();    // The Model-View matrix
	this.pMatrix     = mat4.create();    // The projection matrix
	this.nMatrix     = mat4.create();    // The normal matrix
	this.cMatrix     = mat4.create();    // The camera matrix	
};


SceneTransforms.prototype.calculateModelView = function(){
	this.mvMatrix = this.camera.getViewTransform();
};

SceneTransforms.prototype.calculateNormal = function(){
	
    mat4.identity(this.nMatrix);
    mat4.set(this.mvMatrix, this.nMatrix);
    mat4.inverse(this.nMatrix);
    mat4.transpose(this.nMatrix);
};

SceneTransforms.prototype.calculatePerspective = function(){
    var c = this.camera;
	//Initialize Perspective matrix
    mat4.identity(this.pMatrix);
    mat4.perspective(c.FOV, c_width / c_height, c.minZ, c.maxZ, this.pMatrix);
};


/**
*   Defines the initial values for the transformation matrices
*/
SceneTransforms.prototype.init = function(){
    this.calculateModelView();
    this.calculatePerspective();
    this.calculateNormal();
};


SceneTransforms.prototype.updatePerspective = function(){
    var c = this.camera;
    mat4.perspective(c.FOV, c_width / c_height, c.minZ, c.maxZ, this.pMatrix);  // We can resize the screen at any point so the perspective matrix should be updated always.
};


/**
* Maps the matrices to shader matrix uniforms
*
* Called once per rendering cycle. 
*/
SceneTransforms.prototype.setMatrixUniforms = function(){
	this.calculateNormal();
    gl.uniformMatrix4fv(Program.uMVMatrix, false, this.mvMatrix);  //Maps the Model-View matrix to the uniform prg.uMVMatrix
    gl.uniformMatrix4fv(Program.uPMatrix, false, this.pMatrix);    //Maps the Perspective matrix to the uniform prg.uPMatrix
    gl.uniformMatrix4fv(Program.uNMatrix, false, this.nMatrix);    //Maps the Normal matrix to the uniform prg.uNMatrix
};


SceneTransforms.prototype.push = function(){
	var memento =  mat4.create();
	mat4.set(this.mvMatrix, memento);
	this.stack.push(memento);
};

SceneTransforms.prototype.pop = function(){
	if(this.stack.length == 0) return;
	this.mvMatrix  =  this.stack.pop();
};



