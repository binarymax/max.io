//min.js
$=function(t,n,e){var i=Node.prototype,r=NodeList.prototype,o="forEach",u="trigger",c=[][o],s=t.createElement("i");return r[o]=c,n.on=i.on=function(t,n){return this.addEventListener(t,n,!1),this},r.on=function(t,n){return this[o](function(e){e.on(t,n)}),this},n[u]=i[u]=function(n,e){var i=t.createEvent("HTMLEvents");return i.initEvent(n,!0,!0),i.data=e||{},i.eventName=n,i.target=this,this.dispatchEvent(i),this},r[u]=function(t){return this[o](function(n){n[u](t)}),this},e=function(n){var e=t.querySelectorAll(n||"☺"),i=e.length;return 1==i?e[0]:e},e.on=i.on.bind(s),e[u]=i[u].bind(s),e}(document,this);

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
			$("#"+target).value = years[target];
		}
	}

	var change = function(e) {
		e.stopPropagation();
		var txt = this;
		var era = txt.getAttribute("id");
		var val = parseInt(txt.value);
		display(era,val);
		return false;
	}

	$(".calendaryear").on("change",change);

	$("#CE").value = (new Date()).getFullYear();
	$("#CE").trigger("change");
	
})();