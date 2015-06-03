$(function() {
	var $dropzone = $('.dropzone');
	$dropzone
	.on('dragenter', function() {
		$(this).addClass('over');
	})
	.on('dragover', function(e) {
		e.originalEvent.dataTransfer.dropEffect = 'copy';
		e.preventDefault();
		return false;
	})
	.on('dragleave', function(e) {
		e.preventDefault();
		$(this).removeClass('over');
		return false;
	})
	.on('drop', function(e) {
		e.preventDefault();
		$(this).removeClass('over');
		var files = e.originalEvent.dataTransfer.files;
		
		var atLeastOneTorrent = _.any(files, function(f) {
			return f.type === 'application/x-bittorrent';
		});
		if (!atLeastOneTorrent) {
			var initial = $dropzone.html();
			$dropzone.html('Oops! Sorry, this does not look<br> like a valid Torrent file.');
			return setTimeout(function() { $dropzone.html(initial); }, 4000);
		}
			
		_.each(files, function(file) {
			if (file.type === 'application/x-bittorrent') {
				var reader = new FileReader();
				reader.onload = function(e) {
					var contents = e.target.result;
					var prefix = 'base64,';
					var torrent = contents.substring(contents.indexOf(prefix) + prefix.length);
					// $.post('/parseTorrent', {torrent: torrent}, function(data) {
					// 	console.log(data);
					// });
					$.post('/transmission/torrent-add', {metainfo: torrent}, function(data) {
						console.log(data);
					});
				};
				reader.readAsDataURL(file);
			}
		});
	})
	;
});

// Torrent client:

$(function() {
	if ($('.torrents-list').length) {
		var $torrentsList = $('.torrents-list');
		var refreshActive = function() {
			$.getJSON('/transmission/active', function(result) {
				console.log(result.torrents);
			});
		};
		refreshActive();
		setInterval(refreshActive, 1000);
	}
});
