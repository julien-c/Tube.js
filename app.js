var express = require('express');
var app = express();
var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var glob = require('glob');


// Express setup
app.set('views', './views');
app.set('view engine', 'handlebars');
app.engine('handlebars', require('hbs').__express);


// App variables
app.locals.dirname = __dirname;
app.locals.pathFiles = __dirname+'/files';
app.locals.pathFile = function(id) {
	return util.format('%s/%s.mp4', app.locals.pathFiles, id);
};
app.on('files:reindex', function() {
	app.locals.files = {};
	glob('*.info.json', {cwd: app.locals.pathFiles}, function(err, files) {
		files.forEach(function(f) {
			var id = f.replace('.info.json', '');
			fs.readFile(util.format('%s/%s', app.locals.pathFiles, f), function(err, data) {
				app.locals.files[id] = JSON.parse(data);
			});
		});
	});
});
app.emit('files:reindex');

// Helpers
var thumbs = function(file, width) {
	var n = 50;
	return _.range(0, n).map(function(i) {
		var time = Math.floor(i / n * file.duration);
		return util.format('/thumbs/%s/%d/%d.jpg', file.id, time, width);
	});
};

// Routes
app.use('/static', express.static('static'));
app.use('/files',  express.static('files'));


app.get('/dl/:id',                         require('./lib/youtube-dl'));
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


var server = app.listen(4444);
fs.writeFile('app.lock', process.pid);
try {
	fs.mkdirSync('.cache/');
} catch(e) {} 
