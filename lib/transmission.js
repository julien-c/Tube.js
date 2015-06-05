'use strict';

var _ = require('underscore');

var torrentManager; /* instance of TorrentManager, passed by our Express app. */

var express = require('express');
var routes = express.Router();

routes.get('/methods', function(req, res) {
	res.json(torrentManager.transmission.methods);
});

routes.get('/status', function(req, res) {
	res.json(torrentManager.transmission.status);
});

routes.get('/session', function(req, res) {
	torrentManager.transmission.session(function(err, stats) {
		res.json(stats);
	});
});

routes.get('/session-stats', function(req, res) {
	torrentManager.transmission.sessionStats(function(err, stats) {
		res.json(stats);
	});
});

routes.get('/all', function(req, res) {
	torrentManager.all(function(err, result) {
		res.json(result);
	});
});


routes.post('/torrent-add', function(req, res) {
	if (!(req.body.metainfo || req.body.filename)) {
		return res.status(400).json({error: 'Either "filename" OR "metainfo" MUST be included.'});
	}
	
	var options = {
		'download-dir': torrentManager.pathFiles,
	};
	torrentManager.transmission.addTorrentDataSrc(req.body, options, function(err, torrent) {
		if (err) {
			console.log('Err', err);
			return res.status(400).json(err);
		}
		res.json(torrent);
	});
});



module.exports = function(tManager) {
	torrentManager = tManager;
	return routes;
}
