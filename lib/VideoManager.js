'use strict';

var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var util = require('util');
var glob = require('glob');
var path = require('path');
var mkdirp = require('mkdirp');
var Conversion = require('./lib/Conversion.js');


class Video {
	constructor(infoJson, infoJsonPath) {
		this.infoJson = infoJson;
		this.infoJsonPath = infoJsonPath;   // Path, relative to `files/`
		this.id = this.infoJson.id;
		this.type = this.infoJson.type || 'youtube-dl';
	}
	path() {
		// Path, relative to `files/`
		if (this.type === 'youtube-dl') {
			return this.id + '.mp4';
		}
		return this.infoJson.path;
	}
}



class VideoManager {
	constructor(pathFiles) {
		this.pathFiles = pathFiles;
		this.videos = [];
		_.bindAll(this, 'filesIndex');
	}
	
	filesIndex(callback) {
		var videosOut = [];
		var that = this;
		glob('**/*.info.json', {cwd: that.pathFiles}, function(err, files) {
			async.each(files, function(f, _cb) {
				fs.readFile(util.format('%s/%s', that.pathFiles, f), function(err, data) {
					if (err) { return _cb(); }
					var v = new Video(JSON.parse(data), f);
					videosOut.push(v);
					_cb();
				});
			}, function(err) {
				that.videos = videosOut;
				return callback(err);
			});
		});
	}
	
	addFilesFromTorrent(torrent) {
		var that = this;
		if (torrent.files) {
			torrent.files.forEach(function(f, i) {
				var id = torrent.hashString + '-' + i;
				var infoJson = {
					type: 'torrent',
					id: id,
					torrentName: torrent.name,
					torrentHash: torrent.hashString,
					pathOriginal: f.name,
					status: torrent.status,
				};
				var infoJsonPath = f.name + '.info.json';
				var video = new Video(infoJson, infoJsonPath);
				that.writeInfoJson(video);
				that.videos.push(video);
			});
		}
	}
	
	writeInfoJson(video) {
		var filepath = util.format('%s/%s', this.pathFiles, video.infoJsonPath);
		mkdirp(path.dirname(filepath), function(err) {
			if (err) {
				return console.log(err);
			}
			fs.writeFile(filepath, JSON.stringify(video.infoJson, null, 4));
		});
	}
	
	
	convertFilesFromTorrent(torrent) {
		
	}
}




module.exports = function(pathFiles) {
	return new VideoManager(pathFiles);
};
