'use strict';

var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var util = require('util');
var glob = require('glob');
var path = require('path');
var mkdirp = require('mkdirp');
var Mp4Convert = require('mp4-convert');


function noop() {};


class Video {
	constructor(infoJson, infoJsonPath) {
		this.infoJson = infoJson;
		this.infoJsonPath = infoJsonPath;   // Path, relative to `files/`
		this.id = this.infoJson.id;
		this.type = this.infoJson.type || 'youtube-dl';
	}
	get path() {
		// Path, relative to `files/`
		if (this.type === 'youtube-dl') {
			return this.id + '.mp4';
		}
		return this.infoJson.path;
	}
	
	thumbs(width) {
		var n = 50;
		return _.range(0, n).map((function(i) {
			var time = Math.floor(i / n * this.infoJson.duration);
			return {
				time: time,
				src: util.format('/thumbs/%s/%d/%d.jpg', this.id, time, width),
			};
		}).bind(this));
	}
}



class VideoManager {
	constructor(pathFiles) {
		this.pathFiles = pathFiles;
		this.videos = [];
		_.bindAll(this, 'filesIndex');
	}
	
	findVideoById(id) {
		return _.findWhere(this.videos, {id: id});
	}
	
	// Reading and writing from/to files.
	
	filesIndex(callback) {
		if (!callback) { callback = noop; }
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
	
	writeInfoJson(video /* : Video */) {
		var filepath = util.format('%s/%s', this.pathFiles, video.infoJsonPath);
		mkdirp(path.dirname(filepath), function(err) {
			if (err) {
				return console.log(err);
			}
			fs.writeFile(filepath, JSON.stringify(video.infoJson, null, 4));
		});
	}
	
	updateVideo(video, update) {
		for (var i = 0; i < this.videos.count; i++) {
			if (this.videos[i].id === video.id) {
				_.extend(this.videos[i].id, update);
				this.writeInfoJson(this.videos[i]);
			}
		}
	}
	
	
	// Adding and converting.
	
	addFilesFromTorrent(torrent) {
		var that = this;
		if (torrent.files) {
			torrent.files.forEach(function(f, i) {
				var id = torrent.hashString + '-' + i;
				if (_.contains(['.mp4', '.mkv', '.mov', '.avi'], path.extname(f.name))) {
					var infoJson = {
						type: 'torrent',
						id: id,
						torrentName: torrent.name,
						torrentHash: torrent.hashString,
						pathOriginal: f.name,
						status: 'downloading',
					};
					var infoJsonPath = f.name + '.info.json';
					var video = new Video(infoJson, infoJsonPath);
					that.writeInfoJson(video);
					that.videos.push(video);
				}
			});
		}
	}
	
	
	convertFilesFromTorrent(torrent) {
		torrent.files.forEach((function(f, i) {
			var id = torrent.hashString + '-' + i;
			var video = this.findVideoById(id);
			if (video) {
				if (path.extname(f.name) !== '.mp4') {
					this.updateVideo(video, {status: 'converting'});
					var convert = new Mp4Convert(this.pathFiles+'/'+f.name, this.pathFiles+'/'+f.name + '.mp4');
					convert.on('progress', (function(p) {
						console.log('Progress', p);
						this.updateVideo(video, {progress: p});
					}).bind(this));
					convert.on('done', (function() {
						console.log('Done');
						this.updateVideo(video, {status: 'ready'});
					}).bind(this));
					convert.start();
				}
			}
		}).bind(this));
	}
}




module.exports = function(pathFiles) {
	return new VideoManager(pathFiles);
};
