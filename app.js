var express = require('express');
var app = express();
var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var glob = require('glob');
var async = require('async');
var parseTorrent = require('parse-torrent');


// Express setup
app.set('views', './views');
app.set('view engine', 'handlebars');
app.set('view options', {layout: '_layout'});
app.engine('handlebars', require('hbs').__express);
app.set('trust proxy', 'loopback');


// App variables
app.locals.dirname = __dirname;
app.locals.pathFiles = __dirname+'/files';
app.locals.pathFile = function(id) {
	return util.format('%s/%s.mp4', app.locals.pathFiles, id);
};
app.locals.filesReindex = function(callback) {
	app.locals.files = {};
	glob('*.info.json', {cwd: app.locals.pathFiles}, function(err, files) {
		async.eachSeries(files, function(f, _cb) {
			var id = f.replace('.info.json', '');
			fs.readFile(util.format('%s/%s', app.locals.pathFiles, f), function(err, data) {
				app.locals.files[id] = JSON.parse(data);
				_cb(err);
			});
		}, callback);
	});
};
app.on('files:reindex', function() {
	app.locals.filesReindex();
});
app.emit('files:reindex');

// Helpers
var thumbs = function(file, width) {
	var n = 50;
	return _.range(0, n).map(function(i) {
		var time = Math.floor(i / n * file.duration);
		return {
			time: time,
			src: util.format('/thumbs/%s/%d/%d.jpg', file.id, time, width),
		};
	});
};

// Routes
app.use('/static', express.static('static'));
app.use('/files',  express.static('files'));


app.get('/download', function(req, res) {
	res.render('download', {url: req.query.url});
});
app.get('/upload', function(req, res) {
	res.render('upload');
});
app.get('/torrent', function(req, res) {
	var parsedTorrent = parseTorrent(new Buffer(req.query.torrent, 'base64'));
	delete parsedTorrent.info
	delete parsedTorrent.infoBuffer
	res.json(parsedTorrent);
});

app.get('/download/stream',                require('./lib/youtube-dl').dl);
app.get('/v/:id/probe',                    require('./lib/ffprobe').handleRequest);
app.get('/thumbs/:id/:time/:width.jpg',    require('./lib/ffmpeg'));


app.get('/v/:id.json', function(req, res) {
	res.json(app.locals.files[req.params.id]);
});
app.get('/v/:id/thumbs', function(req, res) {
	var id = req.params.id
	var file = app.locals.files[id];
	file.id = id;
	file.thumbs = thumbs(file, 400);
	res.render('thumbs', file);
});
app.get('/v/:id', function(req, res) {
	var id = req.params.id
	var file = app.locals.files[id];
	file.id = id;
	file.thumbs = thumbs(file, 100);
	file.files = app.locals.files;
	res.render('video', file);
});


app.get('/', function(req, res) {
	res.json(_.map(app.locals.files, function(file, id) {
		var f = _.pick(file, 'categories', 'description', 'fulltitle', 'title');
		f['__'] = req.protocol + '://' + req.get('Host') + '/v/'+id;
		return f;
	}));
});

app.get('/reindex', function(req, res) {
	app.emit('files:reindex');
	res.send();
});

app.get('/proxy', function(req, res) {
	res.json({
		'req.headers': req.headers,
		'req.ip': req.ip,
		'req.ips': req.ips,
		'req.protocol': req.protocol,
	});
});

var server = app.listen(4444, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('App listening at http://%s:%s', host, port);
});
fs.writeFile('app.lock', process.pid);
try {
	fs.mkdirSync('.cache/');
} catch(e) {} 
