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
					$.getJSON('/torrent', {torrent: torrent}, function(data) {
						console.log(data);
					});
				};
				reader.readAsDataURL(file);
			}
		});
	})
	;
});