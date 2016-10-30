var Animate3d = (function(){
	
	var animators = [];

	document.exitFullscreen = 
		document.exitFullscreen         || 
		document.mozCancelFullScreen    || 
		document.webkitExitFullscreen;

	var Animator = function(id,width,height,listening,settings) {
		
		var self = this;

		this.settings = (settings instanceof Array) ? settings:[settings];

		this.container = document.getElementById(id);

		this.mouseX = 0;
		this.mouseY = 0;
		this.origWidth = width;
		this.origHeight = height;
		this.width = width = width || window.innerWidth;
		this.height = height = height || window.innerHeight;
		this.halfX = width>>1;
		this.halfY = height>>1;

		this.listening = listening;

		this.frame = 0;
		this.ambient = [];

		this.uniforms = [];
		this.attributes = [];
		this.shaders = [];

		this.on = true;
		this.one = false;
		
		//Shader templates
		var vertextemplate = document.getElementById("vertextemplate").innerText;
		var fragmentshader = document.getElementById("fragmentshader").innerText;

		//Create the geometries and shaders for each model in settings:
		this.scene = new THREE.Scene();
		for(var i=0;i<settings.length;i++) {
			var set = settings[i];
			var geo = set.fn(set.R, set.r, set.p, set.step, set.zoom);
			
			var vertexshader = vertextemplate.replace('{{model}}',set.fn.shader);
			var texture = new THREE.TextureLoader().load("/images/circle.png");

			self.uniforms[set.name] = {
				texture:  {value:texture},
				amplitude:{value:    1.0},
				zoom:{value:set.zoom*1.0},
				R:   {value:set.R   *1.0},
				Rs:  {value:set.Rs  *1.0},
				r:   {value:set.r   *1.0},
				rs:  {value:set.rs  *1.0},
				p:   {value:set.p   *1.0},
				ps:  {value:set.ps  *1.0}
			};

			self.shaders[set.name] = new THREE.ShaderMaterial({
				uniforms: self.uniforms[set.name],
				vertexShader: vertexshader,
				fragmentShader: fragmentshader
			});
			
			var pts = new THREE.Points( geo, self.shaders[set.name] );
			pts.name = set.name;
			this.scene.add( pts );
		}

		//Create the camera and add the renderer to the DOM
		this.camera = new THREE.PerspectiveCamera( 75, width / height, 1, 3000 );
		this.camera.position.z = 1000;
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( width, height );
		this.container.appendChild( this.renderer.domElement );

		//Event for full screen toggle
		//document.addEventListener("keydown", function(e) { if (e.keyCode == 13) self.fullscreen(true); }, false);
		this.container.addEventListener("fullscreenchange", function(e) { self.fullscreenchange(1); } , false);
		this.container.addEventListener("webkitfullscreenchange", function(e) { self.fullscreenchange(3); } , false);
		document.addEventListener("mozfullscreenchange", function(e) { self.fullscreenchange(2); } , false);

		//Event for pause/play toggle
		//this.container.addEventListener("click", function(e) { self.toggle(); }, false);

		//Event for window resize
		if(width===window.innerWidth && height===window.innerHeight) {
			window.addEventListener("resize", function(e) { self.resize(window.innerWidth,window.innerHeight); }, false );
			this.autoresize = true;
		} else {
			this.autoresize = false;
		}

		//Setup audio input
		if (this.listening) this.listen();

		//Animate!
		this.loop();

	};

	Animator.prototype.render = function() {

		var self = this;
		var time = Date.now() * 0.0000000000005;
		self.camera.position.x += ( self.mouseX - self.camera.position.x ) * 0.05;
		self.camera.position.y += ( - self.mouseY - self.camera.position.y ) * 0.05;
		self.camera.lookAt( self.scene.position );

		var ambient = Math.max((self.ambient.pop()||0)/2,0);

		var axi = ['y','x','z'];
		var def = Math.tau/(360*12);
		for(var i=0;i<self.settings.length;i++) {
			var setting = self.settings[i];
			var object = self.scene.getObjectByName(self.settings[i].name);

			//Rotate along different axis, with ambient magnitude:
			var div = ambient||1;
			var prp = axi[i%2];
			var rot = (div/(Math.PI*100-Math.PI*50));
			object.rotation[prp] += (rot>0?Math.max(rot,def):Math.min(rot,-def)) * (i%2?-1:1);

			//Animate the guilloche
			if (setting.Rs) {
				setting.R = (self.uniforms[setting.name].R.value += setting.Rs);
				if(setting.R<=setting.Rmin || setting.R>=setting.Rmax) setting.Rs*=-1;
			}

			if (setting.rs) {
				setting.r = (self.uniforms[setting.name].r.value += setting.rs);
				if(setting.r<=setting.rmin || setting.r>=setting.rmax) setting.rs*=-1;
			}

			if (setting.ps) {
				setting.p = (self.uniforms[setting.name].p.value += setting.ps);
				if(setting.p<=setting.pmin || setting.p>=setting.rmax) setting.ps*=-1;
			}
			
			//Use the microphone to move the points:
			self.uniforms[setting.name].amplitude.value = ambient;

		}

		//Rock the boat with a sin wave
		//self.uniforms.amplitude.value = Math.sin(self.frame+=0.05)*50;

		self.renderer.render( self.scene, self.camera );
	};

	Animator.prototype.resize = function(width,height) {
		var self = this;
		self.width = width;
		self.height = height;
		self.halfx = width / 2;
		self.halfy = height / 2;

		self.camera.aspect = self.width / self.height;
		self.camera.updateProjectionMatrix();

		self.renderer.setSize( self.width, self.height );
	};

	Animator.prototype.fullscreen = function() {
		var self = this;

		self.container.requestFullscreen = 
			self.container.requestFullscreen       || 
			self.container.mozRequestFullScreen    || 
			self.container.webkitRequestFullscreen;

		if (!document.fullscreenElement) {
			self.container.requestFullscreen();
		}

	};

	Animator.prototype.fullscreenchange = function(b) {
		var self = this;

		self.isfullscreen = self.isfullscreen?false:true;

 		if (self.isfullscreen) {
			if(!self.autoresize) {
				self.resize(window.innerWidth,window.innerHeight);
			}
		} else {
			if(!self.autoresize) {
				self.resize(self.origWidth,self.origHeight);
			}
		}

	};
	
	Animator.prototype.listen = function() {
		var self = this;
		mic.listen(function(val){
			if (val instanceof Array) {
				self.ambient = self.ambient.concat(val);
			} else {
				self.ambient.push(val);
			}
		});
	};

	Animator.prototype.loop = function() {
		var self = this;
		requestAnimationFrame(function(){self.loop();});
		if (self.on) self.render();
		else if (self.one) {self.render(); self.one=false;}
	};

	Animator.prototype.toggle = function(val){
		if (typeof val !== 'undefined') {
			this.on = val?true:false;
		} else {
			this.on = !this.on;
		}
	};

	return function(id,width,height,listening,settings) {
		var a = new Animator(id,width,height,listening,settings);
		animators.push(a);
		return a;
	};

})();