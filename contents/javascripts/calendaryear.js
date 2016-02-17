var CalendarYearConverter = (function(){

	/*
	This is how you find CE from them:
	BE-543=CE
	JS+638=CE
	RS+1781=CE
	*/

	var eras = {
		CE:{
			BE:function(y) {return y+543},
			JS:function(y) {return y-638},
			RS:function(y) {return y-1781}
		},
		BE:{
			CE:function(y) {return y-543},
			JS:function(y) {return eras.CE.JS(eras.BE.CE(y))},
			RS:function(y) {return eras.CE.RS(eras.BE.CE(y))}
		},
		JS:{
			CE:function(y) {return y+638},
			BE:function(y) {return eras.CE.BE(eras.JS.CE(y))},
			RS:function(y) {return eras.CE.RS(eras.JS.CE(y))}
		},
		RS:{
			CE:function(y) {return y+1781},
			BE:function(y) {return eras.CE.BE(eras.RS.CE(y))},
			JS:function(y) {return eras.CE.JS(eras.RS.CE(y))}
		}
	}

	var from = function(era,year) {
		var source = eras[era];
		var output = {};
		if (source) {
			for(var target in source) {
				if (source.hasOwnProperty(target)) {
					output[target] = source[target](year);
				}
			}
		}
		return output;
	}

	var display = function(era,year) {
		var years = from(era,year);
		for(var target in years) {
			$("#"+target).val(years[target]);
		}
	}

	var change = function(e) {
		e.stopPropagation();
		var txt = $(this);
		var era = txt.attr("id");
		var val = parseInt(txt.val());
		display(era,val);
		return false;
	}

	$(".calendaryear").on("change",change);

	$(function(){
		var year = (new Date()).getFullYear();
		$("#CE").val(year);
		$("#CE").trigger("change");
	});

})();