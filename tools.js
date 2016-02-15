var config = JSON.parse(require('fs').readFileSync('config.json'));

var tools = module.exports = {};

tools.image = function(str) {
	return str || "http://binarymax.com/star200.png";
};

tools.description = function(str) {
	return str || config.locals.description;
};