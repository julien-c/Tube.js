var Transmission = require('transmission');
var transmission = new Transmission();
var _ = require('underscore');


var express = require('express');
var routes = express.Router();

routes.get('/methods', function(req, res) {
	res.json(transmission.methods);
});

routes.get('/status', function(req, res) {
	res.json(transmission.status);
});

routes.post('/torrent-add', function(req, res) {
	if (!(req.body.metainfo || req.body.filename)) {
		return res.status(400).json({error: 'Either "filename" OR "metainfo" MUST be included.'});
	}
	
	var options = {
		'download-dir': req.app.locals.pathFiles,
	};
	transmission.addTorrentDataSrc(req.body, options, function(err, torrent) {
		if (err) {
			console.log('Err', err);
			return res.status(400).json(err);
		}
		res.json(torrent);
	});
});

routes.get('/session', function(req, res) {
	transmission.session(function(err, stats) {
		res.json(stats);
	});
});

routes.get('/session-stats', function(req, res) {
	transmission.sessionStats(function(err, stats) {
		res.json(stats);
	});
});

routes.get('/all', function(req, res) {
	transmission.all(function(err, result) {
		result.torrents = _.filter(result.torrents, function(t) {
			return t.downloadDir === req.app.locals.pathFiles;
		});
		res.json(result);
	});
});

routes.get('/active', function(req, res) {
	transmission.active(function(err, result) {
		result.torrents = _.filter(result.torrents, function(t) {
			return t.downloadDir === req.app.locals.pathFiles;
		});
		res.json(result);
	});
});


module.exports = routes;
