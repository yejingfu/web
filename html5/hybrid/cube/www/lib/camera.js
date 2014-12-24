/**
*   Camera
*/

window.Camera = function(t){
    this.matrix     = mat4.create();
    this.up         = vec3.create();
    this.right      = vec3.create();
    this.normal     = vec3.create();
    this.position   = vec3.create();
    this.focus      = vec3.create();
    this.azimuth    = 0.0;
    this.elevation  = 0.0;
    this.type       = t;
    this.steps      = 0;
    
    this.home = vec3.create();
      
    this.hookRenderer = null;
    this.hookGUIUpdate = null;
    
    this.FOV = 30;
    this.minZ = 0.1;
    this.maxZ = 10000
};

Camera.CAMERA_ORBITING_TYPE = 1;
Camera.CAMERA_TRACKING_TYPE = 2;

Camera.prototype.setType = function(t){
    
    this.type = t;
    
    if (t != Camera.CAMERA_ORBITING_TYPE && t != Camera.CAMERA_TRACKING_TYPE) {
        alert('Wrong Camera Type!. Setting Orbitting type by default');
        this.type = Camera.CAMERA_ORBITING_TYPE;
    }
};

Camera.prototype.goHome = function(h){
    if (h != null){
        this.home = h;
    }
    
    this.setPosition(this.home);
    this.setAzimuth(0);
    this.setElevation(0);
    this.steps = 0;
};

Camera.prototype.dolly = function(s){
    var c = this;
    
    var p =  vec3.create();
    var n = vec3.create();
    
    p = c.position;
    
    var step = s - c.steps;
    
    vec3.normalize(c.normal,n);
    
    var newPosition = vec3.create();
    
    if(c.type == Camera.CAMERA_TRACKING_TYPE){
        newPosition[0] = p[0] - step*n[0];
        newPosition[1] = p[1] - step*n[1];
        newPosition[2] = p[2] - step*n[2];
    }
    else{
        newPosition[0] = p[0];
        newPosition[1] = p[1];
        newPosition[2] = p[2] - step; 
    }
	
    c.setPosition(newPosition);
    c.steps = s;
};

Camera.prototype.setPosition = function(p){
    vec3.set(p, this.position);
    this.update();
};

//This operation consists in aligning the normal to the focus vector
Camera.prototype.setFocus = function(f){
	vec3.set(f, this.focus);
    
    // var n = vec3.create(); 
    // vec3.set(this.normal,n);
    // var n_floor = vec3.create(); 
    // vec3.set(this.normal, n_floor);
    // n_floor[1] = 0; //projecting vector on floor
    
    // vec3.normalize(n);
    // vec3.normalize(n_floor);
    // var angle = Math.acos(vec3.dot(n, n_floor)) * 180 / Math.PI;
    
    
    // var f = vec3.create(); vec3.set(this.focus,f);
    // var p = vec3.create(); vec3.set(this.position,p);
    
    // var los = vec3.create(); //los : line of sight
    // vec3.subtract(p,f,los);
    // var los_floor = vec3.create();
    // vec3.set(los, los_floor);
    // los_floor[1] = 0;
    // vec3.normalize(los);
    // vec3.normalize(los_floor);
    // var angle_los = Math.acos(vec3.dot(los, los_floor)) * 180 / Math.PI;
    
    
    // console.info('elevation of line of sight :' + angle_los);
    
    // var chElevation = angle  - angle_los;
    
    // this.setElevation(chElevation);
    
	this.update();
};

Camera.prototype.setAzimuth = function(az){
    this.changeAzimuth(az - this.azimuth);
};

Camera.prototype.changeAzimuth = function(az){
    var c = this;
    c.azimuth +=az;
    
    if (c.azimuth > 360 || c.azimuth <-360) {
		c.azimuth = c.azimuth % 360;
	}
    c.update();
};

Camera.prototype.setElevation = function(el){
    this.changeElevation(el - this.elevation);
};

Camera.prototype.changeElevation = function(el){
    var c = this;
    
    c.elevation +=el;
    
    if (c.elevation > 360 || c.elevation <-360) {
		c.elevation = c.elevation % 360;
	}
    c.update();
};

Camera.prototype.calculateOrientation = function(){
	var m = this.matrix;
    mat4.multiplyVec4(m, [1, 0, 0, 0], this.right);
    mat4.multiplyVec4(m, [0, 1, 0, 0], this.up);
    mat4.multiplyVec4(m, [0, 0, 1, 0], this.normal);
};

Camera.prototype.update = function(){
	mat4.identity(this.matrix);
	
	this.calculateOrientation();
    
    if (this.type == Camera.CAMERA_TRACKING_TYPE){
        mat4.translate(this.matrix, this.position);
        mat4.rotateY(this.matrix, this.azimuth * Math.PI/180);
        mat4.rotateX(this.matrix, this.elevation * Math.PI/180);
    }
    else {
        var trxLook = mat4.create();
        mat4.rotateY(this.matrix, this.azimuth * Math.PI/180);
        mat4.rotateX(this.matrix, this.elevation * Math.PI/180);
        mat4.translate(this.matrix,this.position);
        //mat4.lookAt(this.position, this.focus, this.up, trxLook);
        //mat4.inverse(trxLook);
        //mat4.multiply(this.matrix,trxLook);
    }

    this.calculateOrientation();
    
    /**
    * We only update the position if we have a tracking camera.
    * For an orbiting camera we do not update the position. If
    * you don't believe me, go ahead and comment the if clause...
    * Why do you think we do not update the position?
    */
    if(this.type == Camera.CAMERA_TRACKING_TYPE){
        mat4.multiplyVec4(this.matrix, [0, 0, 0, 1], this.position);
    }
    
    //console.info('------------- update -------------');
    //console.info(' right: ' + vec3.str(this.right)+', up: ' + vec3.str(this.up)+',normal: ' + vec3.str(this.normal));
    //console.info('   pos: ' + vec3.str(this.position));
    //console.info('   azimuth: ' + this.azimuth +', elevation: '+ this.elevation);
    if(this.hookRenderer){
        this.hookRenderer();
    }
    if(this.hookGUIUpdate){
        this.hookGUIUpdate();
    }
    
};

Camera.prototype.getViewTransform = function(){
    var m = mat4.create();
    mat4.inverse(this.matrix, m);
    return m;
};


///////////////////////////////////////

/**
* Camera Interactor
*
* This object listens for mouse and keyboard events on the canvas, then, it interprets them and sends the intended instruction to the camera
*/
window.CameraInteractor = function(camera,canvas){
    
    this.camera = camera;
    this.canvas = canvas;
    this.update();
    
    this.dragging = false;
    this.picking = false;
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.button = 0;
    this.ctrl = false;
    this.key = 0;
    
    this.MOTION_FACTOR = 10.0;
    this.dloc = 0;
    this.dstep = 0;
	
	this.picker = null;
    
}

CameraInteractor.prototype.setPicker = function(p){
	this.picker = p;
}

/**
* Obtain screen coordinates
*/
CameraInteractor.prototype.get2DCoords = function(ev){
	var x, y, top = 0, left = 0, obj = this.canvas;

	while (obj && obj.tagName != 'BODY') {
		top += obj.offsetTop;
		left += obj.offsetLeft;
		obj = obj.offsetParent;
	}
    
    left += window.pageXOffset;
    top  += window.pageYOffset;
 
	// return relative mouse position
	x = ev.clientX - left;
	y = c_height - (ev.clientY - top); //c_height is a global variable that we maintain in codeview.js
                                       //this variable contains the height of the canvas and it updates dynamically
                                       //as we resize the browser window.
	
	return {x:x,y:y};
}

CameraInteractor.prototype.onMouseUp = function(ev){
	this.dragging = false;
    
    if (!ev.shiftKey){
        this.picking = false;
        if (this.picker){
            this.picker.stop();
        }
    }
}

CameraInteractor.prototype.onMouseDown = function(ev){
    this.dragging = true;
    this.x = ev.clientX;
	this.y = ev.clientY;
	this.button = ev.button;
	this.dstep = Math.max(this.camera.position[0],this.camera.position[1],this.camera.position[2])/100;
    
    if (this.picker == null) return;
    
    var coords = this.get2DCoords(ev);
    this.picking = this.picker.find(coords);
    
    if (this.picking){
        var count = this.picker.plist.length;
        var message = count==1?count+' object has been selected': count+' objects have been selected';
        jquery('#title-id').html(message);
    }
    else{
        this.picker.stop();
        jquery('#title-id').html('Please select an object and drag it. (Alt key drags on the camera axis)');
    }
}

CameraInteractor.prototype.onMouseMove = function(ev){
	this.lastX = this.x;
	this.lastY = this.y;
	this.x = ev.clientX;
    this.y = ev.clientY;
	
	if (!this.dragging) return;
		

	this.ctrl = ev.ctrlKey;
	this.alt = ev.altKey;
	var dx = this.x - this.lastX;
	var dy = this.y - this.lastY;
    
    if (this.picking && this.picker.moveCallback){
        this.picker.moveCallback(this,dx,dy);
        return;
    }
	
	if (this.button == 0) { 
		if(this.alt){
			this.dolly(dy);
		}
		else{ 
			this.rotate(dx,dy);
		}
	}
}

CameraInteractor.prototype.onKeyDown = function(ev){
    var c = this.camera;
	
	this.key = ev.keyCode;
	this.ctrl = ev.ctrlKey;
	
	if (!this.ctrl){
		if (this.key == 38){
			c.changeElevation(10);
		}
		else if (this.key == 40){
			c.changeElevation(-10);
		}
		else if (this.key == 37){
			c.changeAzimuth(-10);
		}
		else if (this.key == 39){
			c.changeAzimuth(10);
		}
        else if (this.key == 87) {  //w
            if(fovy) fovy+=5;
            console.info('FovY:'+fovy);
        }
        else if (this.key == 78) { //n
            if(fovy) fovy-=5;
            console.info('FovY:'+fovy);
        }
        
	}
}

CameraInteractor.prototype.onKeyUp = function(ev){
    if (ev.keyCode == 17){
		this.ctrl = false;
	}
}

CameraInteractor.prototype.update = function(){
    var self = this;
	var canvas = this.canvas;
	

	canvas.onmousedown = function(ev) {
		self.onMouseDown(ev);
    }

    canvas.onmouseup = function(ev) {
		self.onMouseUp(ev);
    }
	
	canvas.onmousemove = function(ev) {
		self.onMouseMove(ev);
    }
	
	window.onkeydown = function(ev){
		self.onKeyDown(ev);
	}
	
	window.onkeyup = function(ev){
		self.onKeyUp(ev);
	}
}

CameraInteractor.prototype.dolly = function(value){
 	if (value>0){
 		this.dloc += this.dstep;
 	}
 	else{
 		this.dloc -= this.dstep;
 	}
	this.camera.dolly(this.dloc);
}

CameraInteractor.prototype.rotate = function(dx, dy){
	
	
	var camera = this.camera;
	var canvas = this.canvas;
	
	var delta_elevation = -20.0 / canvas.height;
	var delta_azimuth   = -20.0 / canvas.width;
				
	var nAzimuth = dx * delta_azimuth * this.MOTION_FACTOR;
	var nElevation = dy * delta_elevation * this.MOTION_FACTOR;
	
	camera.changeAzimuth(nAzimuth);
	camera.changeElevation(nElevation);
}



