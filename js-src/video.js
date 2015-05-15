$(function() {
	var video = document.querySelector('video.video');
	if (video !== null) {
		$('.thumbnail-seek').click(function() {
			video.currentTime = parseInt($(this).data('time'), 10);
		});
	}
});