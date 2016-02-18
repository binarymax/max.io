var CalendarYearConverter = (function(){

	var year = function(d) {
		if(d instanceof Date) return d.getFullYear();
		if(d>-9999 && d<9999) return d;
	}

	var eras = {
		BE:{
			getCE: function(date) {return year(date)-543},
			setCE: function(date) {return year(date)+543}
		},
		JS:{
			getCE: function(date) {return year(date)+638},
			setCE: function(date) {return year(date)-638}
		},
		RS:{
			getCE: function(date) {return year(date)+1781},
			setCE: function(date) {return year(date)-1781}
		}
	}

	var all = function(source,date) {
		var output = {};
		if (source==='CE') {
			for(var era in eras) {
				if(eras.hasOwnProperty(era)) {
					output[era] = eras[era].setCE(date);
				}
			}
		} else {
			output = all('CE',eras[source].getCE(date));
			output.CE = eras[source].getCE(date);
		}
		return output;
	}

	var display = function(era,year) {
		var years = all(era,year);
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