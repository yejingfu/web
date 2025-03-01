/*
function Program() {
  this.prg = null;
};

Program.prototype = {
*/

window.Program = {
    prg: null,

    /**
    * Utilitary function that allows to set up the shaders (program) using an embedded script (look at the beginning of this source code)
    */
    getShader : function(gl, id) {
       var script = document.getElementById(id);
       if (!script) {
           return null;
       }

        var str = "";
        var k = script.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader, message;
        if (script.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
            message = 'Fragment Shader';
        } else if (script.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
            message = 'Vertex Shader';
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('There was a problem with the ' + message +':\n\n'+ gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    },
    
    /**
    * The program contains a series of instructions that tell the Graphic Processing Unit (GPU)
    * what to do with every vertex and fragment that we pass it. 
    * The vertex shader and the fragment shader together are called the program.
    */
    load : function(attributeList, uniformList, vshaderId, fshaderId) {

     var fragmentShader          = this.getShader(gl, fshaderId);
     var vertexShader            = this.getShader(gl, vshaderId);
     
     this.prg = gl.createProgram();
     gl.attachShader(this.prg, vertexShader);
     gl.attachShader(this.prg, fragmentShader);
     gl.linkProgram(this.prg);

     if (!gl.getProgramParameter(this.prg, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
     }

     gl.useProgram(this.prg);
	 
	 this.setAttributeLocations(attributeList);
	 this.setUniformLocations(uniformList);

    },
	
	setAttributeLocations: function (attrList){
		
		for(var i=0, max = attrList.length; i <max; i+=1){
			this[attrList[i]] = gl.getAttribLocation(this.prg, attrList[i]);
		}

	},
	
	setUniformLocations: function (uniformList){
		
		for(var i=0, max = uniformList.length; i < max; i +=1){
			this[uniformList[i]] = gl.getUniformLocation(this.prg, uniformList[i]);
		}
	},
    
    getUniform: function (uniformLocation){
        return gl.getUniform(this.prg, uniformLocation);
    }
};

