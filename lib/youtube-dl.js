var child_process = require('child_process');
var util = require('util');
var fs = require('fs');


var dl = function(req, res) {
	if (req.query.url === 'foo') { return test(req, res); }
	
	var url = req.query.url;
	var videoId = null;
	res.set({
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive',
	});
	res.writeSse = function(data, event) {
		if (typeof event !== 'undefined') {
			res.write('event: ' + event + '\n');
		}
		data.split('\n').forEach(function(l) {
			res.write('data: ' + l + '\n');
		});
		res.write('\n');
	};
	res.pleaseClose = function() {
		res.writeSse("", 'pleaseClose');
		return res;
	};
	
	var args = [
		'--force-ipv4',
		'--id',
		'--write-info-json',
		'--xattrs',
		'--recode-video',
		'mp4',
		'--newline',
		url,
	];
	// --force-ipv4                     Make all connections via IPv4 (experimental)
	// --id                             Use only video ID in file name
	// --write-info-json                Write video metadata to a .info.json file
	// --xattrs                         Write metadata to the video file's xattrs (using dublin core and xdg standards)
	// --recode-video FORMAT            Encode the video to another format if necessary (currently supported: mp4|flv|ogg|webm|mkv)
	// --newline                        Output progress bar as new lines
	
	res.writeSse('youtube-dl '+args.join(' '), 'command');
	
	var child = child_process.spawn('youtube-dl', args, {cwd: req.app.locals.pathFiles});
	
	child.stdout.on('data', function(data) {
		data = data.toString().trim();
		res.writeSse(data);
		var match = data.match(/[^ ]+.info.json/g)
		if (match) {
			videoId = match[0].replace('.info.json', '');
		}
	});
	child.stderr.on('data', function(data) {
		res.writeSse(data.toString(), 'err');
	});
	
	child.on('error', function(err) {
		console.log('Error', err);
		res.writeSse('Error', 'err');
		res.pleaseClose().end();
	});
	child.on('exit', function(code, signal) {
		if (code !== 0) {
			console.log('Unsuccessful exit code '+code, signal);
			res.writeSse('Unsuccessful exit code '+code, 'err');
			return res.pleaseClose().end();
		}
		req.app.locals.filesReindex(function(err) {
			if (videoId && req.app.locals.files.hasOwnProperty(videoId)) {
				res.writeSse(util.format('/v/%s', videoId), 'redirect');
				res.pleaseClose().end();
			}
		});
	});
	// @todo: Persist stdout/stderr
}

var test = function(req, res) {
	res.set({
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive',
	});
	var i = 0;
	setInterval(function() {
		res.write('data: ' + i + '\n\n');
		i++;
	}, 500);
};

module.exports.dl = dl;
module.exports.test = test;
