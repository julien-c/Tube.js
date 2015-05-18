var child_process = require('child_process');
var util = require('util');
var fs = require('fs');


var dl = function(req, res) {
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
		return res.write('data: ' + data + '\n\n');
	};
	
	var args = [
		'--force-ipv4',
		'--id',
		'--write-info-json',
		'--xattrs',
		'--recode-video',
		'mp4',
		url,
	];
	// --force-ipv4                     Make all connections via IPv4 (experimental)
	// --id                             Use only video ID in file name
	// --write-info-json                Write video metadata to a .info.json file
	// --xattrs                         Write metadata to the video file's xattrs (using dublin core and xdg standards)
	// --recode-video FORMAT            Encode the video to another format if necessary (currently supported: mp4|flv|ogg|webm|mkv)
	
	res.writeSse('youtube-dl '+args.join(' '), 'command');
	
	var child = child_process.spawn('youtube-dl', args, {cwd: req.app.locals.pathFiles});
	
	child.stdout.on('data', function(data) {
		res.writeSse(data);
		var line = data.toString();
		var match = line.match(/[^ ]+.info.json/g)
		if (match) {
			videoId = match[0].replace('.info.json', '');
		}
	});
	child.stderr.on('data', function(data) {
		res.writeSse(data, 'err');
	});
	
	child.on('error', function(err) {
		console.log('Error', err);
		res.end();
	});
	child.on('exit', function(code, signal) {
		if (code !== 0) {
			console.log('Unsuccessful exit code '+code);
			return res.writeSse('Unsuccessful exit code '+code, 'err').end();
		}
		req.app.locals.filesReindex(function(err) {
			if (videoId && req.app.locals.files.hasOwnProperty(videoId)) {
				res.writeSse(util.format('/v/%s', videoId), 'redirect');
			}
		});
		
	});
	// @todo: Persist stdout/stderr
}

module.exports = dl;
