(function(){
	
	var draw = function(cid,plot) {
		var cvs = document.getElementById(cid);
		var ctx = cvs.getContext("2d"); 
		var xmax = cvs.width = parseInt(cvs.style.width.substr(0,3)); 
		var ymax = cvs.height = parseInt(cvs.style.height.substr(0,3));
		var img = ctx.createImageData(xmax,ymax);
		var pix = img.data;
		for(var x=0,i=0;x<xmax;x++) {
			for(var y=0;y<ymax;y++) {
				i = (x+y*xmax)*4;
				pix[i+0] = pix[i+1] = pix[i+2] = plot(x,y);
				pix[i+3] = y+5;
			}
		}
		ctx.putImageData(img,0,0);
	}

	draw("patternxor",function(x,y){return parseInt((Math.sin(x^(y+100))*Math.cos(x&(y+100))) *255)});
	draw("patternand",function(x,y){return parseInt((Math.sin(x^(y+100))*Math.tan(x|(y+100))) *255)});
	draw("patterntan",function(x,y){return parseInt((Math.tan(x^(y+100))*Math.cos(x&(y+100))) *255)});

})();