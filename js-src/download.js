$(function() {
	var $form = $('form.download');
	var $input = $form.find('input[type="text"]');
	
	var source;
	$form.submit(function(e) {
		e.preventDefault();
		if (typeof source !== 'undefined') {
			source.close();
		}
		source = new EventSource('/download/stream?url='+encodeURIComponent($input.val()));
		source.addEventListener('open', function(e) {
			$('pre.output').removeClass('hide');
		});
		source.addEventListener('message', function(e) {
			$('pre.output').append(e.data);
		});
	});
	
	if ($form.length) {
		if ($input.val() !== "") { $form.submit(); }
	}
});