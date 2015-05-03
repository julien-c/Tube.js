var child_process = require('child_process');
var util = require('util');
var assert = require('assert');
var fs = require('fs');


module.exports = function(req, res) {
	var id = req.params.id;
	var filepath = req.app.locals.pathFile(id);
	
	var time = req.params.time.replace(/[^\d:]/g, '');
	var width = Math.min(parseInt(req.params.width), 1200);
	var cacheKey = util.format('%s-%s-%d.jpg', id, time, width);
	var cachePath = req.app.locals.dirname+'/.cache/'+cacheKey;
	
	fs.exists(cachePath, function(exists) {
		res.set('Cache-Control', 'max-age=630720000, public').type('jpeg');
		if (exists) {
			return res.set('X-Cache', 'Hit').sendFile(cachePath);
		}
		
		var command = util.format('ffmpeg -ss %s -i %s -frames:v 1 -filter:v scale=%d:-1 -f image2 pipe:1', time, filepath, width);
		// Output to stdout as a JPEG image
		
		child_process.exec(command, {encoding: 'buffer'}, function(error, stdout, stderr) {
			assert(Buffer.isBuffer(stdout));
			res.set('X-Cache', 'Miss').send(stdout);
			fs.writeFile(cachePath, stdout);
		});
	});
}