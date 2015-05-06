var child_process = require('child_process');
var util = require('util');
var fs = require('fs');


var dl = function(req, res) {
	var id = req.params.id;
	var command = util.format('youtube-dl --force-ipv4 --id --write-info-json --xattrs --recode-video mp4 "%s"', id);
	// --force-ipv4                     Make all connections via IPv4 (experimental)
	// --id                             Use only video ID in file name
	// --write-info-json                Write video metadata to a .info.json file
	// --xattrs                         Write metadata to the video file's xattrs (using dublin core and xdg standards)
	// --recode-video FORMAT            Encode the video to another format if necessary (currently supported: mp4|flv|ogg|webm|mkv)
	
	child_process.exec(command, {cwd: req.app.locals.pathFiles}, function(error, stdout, stderr) {
		req.app.emit('files:reindex');
		fs.writeFileSync(util.format('%s/%s-stdout.txt', req.app.locals.pathFiles, id), stdout);
		fs.writeFileSync(util.format('%s/%s-stderr.txt', req.app.locals.pathFiles, id), stderr);
		res.redirect(util.format('/v/%s', id));
	});
}

module.exports = dl;
