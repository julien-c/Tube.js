'use strict';

var Transmission = require('transmission');
var transmission = new Transmission({
	username: 'transmission',
	password: 'transmission',
});
var _ = require('underscore');
var util = require('util');



class TorrentManager {
	constructor(pathFiles, videoManager) {
		this.pathFiles = pathFiles;
		this.videoManager = videoManager;
		this.transmission = transmission;
		this.startingUp = true;
		this.torrentsList = [];
		_.bindAll(this, 'poll');
	}
	startPolling() {
		this._interval = setInterval(this.poll, 1000);
	}
	stopPolling() {
		clearInterval(this._interval);
	}
	all(callback) {
		var pathFiles = this.pathFiles;
		this.transmission.all(function(err, result) {
			if (err) {
				return callback(err);
			}
			// Restrict to torrents that live under this Tube.js instance.
			result.torrents = _.filter(result.torrents, function(t) {
				return t.downloadDir === pathFiles;
			});
			return callback(null, result);
		});
	}
	
	
	poll() {
		this.all(_.bind(function(err, result) {
			var torrents = result.torrents;
			// Starting up:
			if (this.startingUp) {
				this.torrentsList = torrents;
				this.startingUp = false;
				return;
			}
			// Checking if anything changed:
			for (var t of torrents) {
				var tOld = _.findWhere(this.torrentsList, {hashString: t.hashString});
				if (!tOld) {
					console.log('✓ New Torrent detected: '+t.hashString);
					if (t.metadataPercentComplete === 1) {
						this.videoManager.addFilesFromTorrent(t);
					}
				}
				else {
					// This torrent was already present in some form.
					if (t.metadataPercentComplete === 1 && tOld.metadataPercentComplete !== 1) {
						console.log('✓ New Torrent meta completed: '+t.hashString);
						this.videoManager.addFilesFromTorrent(t);
					}
					if (t.isFinished && !tOld.isFinished) {
						console.log('✓ New Torrent is finished: '+t.hashString);
						// todo: Start conversion.
						this.videoManager.convertFilesFromTorrent(t);
					}
				}
			}
			this.torrentsList = torrents;
		}, this));
	}
}

module.exports = function(pathFiles, videoManager) {
	return new TorrentManager(pathFiles, videoManager);
};

