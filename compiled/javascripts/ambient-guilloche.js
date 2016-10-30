(function(){

	var inc = Math.tau/10000000;
	var ind = Math.tau/1000000;

	var cross = { 
		name:'cross', fn:Guilloche3d.cross,
		R:314/2, Rs:inc, Rmin:1, Rmax:314, r:-0.25, rs:inc, rmin:-0.50, rmax:-0.01, p:12, ps:inc, pmin:4, pmax:20, zoom:20, step:0.0001
	};
	var cylinder = { 
		name:'cylinder', fn:Guilloche3d.cylinder,
		R:314/2, Rs:inc, Rmin:1, Rmax:314, r:-0.25, rs:inc, rmin:-0.50, rmax:-0.01, p:12, ps:inc, pmin:4, pmax:20, zoom:20, step:0.0001
	};
	var ribbon = { 
		name:'ribbon', fn:Guilloche3d.ribbon,
		R:60,    Rs:ind, Rmin:40, Rmax:120, r:-0.25, rs:ind, rmin:-0.50, rmax:-0.01, p:12, ps:ind, pmin:4, pmax:20, zoom:8, step:0.0001
	};
	var rosette = { 
		name:'rosette', fn:Guilloche3d.rosette,
		R:73,    Rs:inc, Rmin:1, Rmax:157, r:-0.25, rs:inc, rmin:-0.50, rmax:-0.01, p:25, ps:inc, pmin:4, pmax:20, zoom:20, step:0.0001
	};
	var river = { 
		name:'river', fn:Guilloche3d.river,
		R:70,    Rs:inc, Rmin:60, Rmax:80, r:-0.25, rs:inc, rmin:-0.50, rmax:-0.01, p:25, ps:inc, pmin:4, pmax:20, zoom:12, step:0.0001
	};
	var knee = { 
		name:'knee', fn:Guilloche3d.knee,
		R:500,   Rs:ind, Rmin:400, Rmax:600, r:-0.25, rs:ind, rmin:-0.50, rmax:-0.01, p:25, ps:ind, pmin:4, pmax:20, zoom:20, step:0.00005
	};
	var shell = { 
		name:'shell', fn:Guilloche3d.shell,
		R:60,    Rs:inc, Rmin:40, Rmax:120, r:-0.5, rs:inc, rmin:-1.50, rmax:-0.01, p:25, ps:inc, pmin:4, pmax:20, zoom:10, step:0.0001
	};

	var donut = { 
		name:'donut', fn:Guilloche3d.donut,
		R:60,    Rs:inc, Rmin:20, Rmax:240, r:-0.5, rs:inc, rmin:-2.50, rmax:-0.01, p:25, ps:inc, pmin:2, pmax:50, zoom:16, step:0.00015
	};

	var sine = { 
		name:'sine', fn:Guilloche3d.sine,
		R:60,    Rs:ind, Rmin:20, Rmax:240, r:-0.5, rs:ind, rmin:-2.50, rmax:-0.01, p:25, ps:ind, pmin:2, pmax:50, zoom:16, step:0.08
	};

	var models1 = [];
	var models2 = [];

	models1.push(river);

	models2.push(knee);
	models2.push(cross);
	models2.push(cylinder);
	models2.push(ribbon);
	models2.push(rosette);
	models2.push(river);
	models2.push(shell);
	models2.push(donut);

	var width = window.innerWidth/2;
	var height = window.innerHeight/2;
	var listening1 = false;
	var listening2 = true;
	var animators = {
		guilloche1 : Animate3d('guilloche1',width,height,listening1,models1),
		guilloche2 : Animate3d('guilloche2',width,height,listening2,models2)/*,
		guilloche3 : Animate3d('guilloche3',width,height,listening,models3),
		guilloche4 : Animate3d('guilloche4',width,height,listening,models4)*/
	}

	var swaptoggle = function(el) {
		var tmp = el.getAttribute("data-toggle");
		el.setAttribute("data-toggle",el.innerHTML);
		el.innerHTML = tmp;
	};

	var playcontrol = function(el){
		var target = el.getAttribute("data-target");
		el.onclick = function(){
			swaptoggle(el);
			animators[target].toggle();
		};
	};

	var fullcontrol = function(el){
		var target = el.getAttribute("data-target");
		el.onclick = function(){
			animators[target].fullscreen();
		};
	};

	var plays = document.querySelectorAll(".play");
	for(var i=0;i<plays.length;i++) playcontrol(plays[i]);
	var fulls = document.querySelectorAll(".full");
	for(var i=0;i<fulls.length;i++) fullcontrol(fulls[i]);

})()