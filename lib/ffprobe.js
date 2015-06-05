var child_process = require('child_process');
var util = require('util');



var ffprobe = function(filepath, callback) {
	var command = util.format('ffprobe -hide_banner %s', filepath);
	child_process.exec(command, callback);
};

var json = function(filepath, callback) {
	var command = util.format('ffprobe -print_format json -show_format -show_streams %s', filepath);
	// When outputting to json, you have to opt in to each piece of info.
	child_process.exec(command, callback);
};


module.exports.json = json;

module.exports.handleRequest = function(req, res) {
	var path = req.app.locals.pathFiles+'/'+req.video.path;
	if (typeof req.query.json !== 'undefined') {
		json(path, function(error, stdout) {
			res.type('json').send(stdout);
		});
	}
	else {
		ffprobe(path, function(error, stdout, stderr) {
			// Apparently ffprobe writes to stderr not stdout.
			res.type('text').send(stdout + stderr);
		});
	}
};