var config = JSON.parse(require('fs').readFileSync('config.json'));

var tools = module.exports = {};

tools.published = function(datestr) {
	if(datestr) {
		return (new Date(datestr)).toISOString()
	} else {
		return (new Date()).toISOString()
	}
}

tools.canonical = function(relative) {
	if(relative) {
		return `https://maxirwin.com${relative}`;
	}
	return "https://maxirwin.com/";
}

tools.image = function(str,relative) {
	if(str&&relative) {
		return `https://maxirwin.com${relative}${str}`;
	}
	return str || "https://maxirwin.com/star200.png";
};

tools.description = function(str) {
	return str || config.locals.description;
};