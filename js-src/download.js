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
		source.addEventListener('command', function(e) {
			$('pre.output').append('<strong>$</strong> '+e.data+'\n');
		});
		source.addEventListener('message', function(e) {
			$('pre.output').append(e.data+'\n');
		});
		source.addEventListener('err', function(e) {
			$('pre.output').append('<span class="err">'+e.data+'</span>'+'\n');
		});
		source.addEventListener('redirect', function(e) {
			$('pre.output').append('\n'+'<span class="redirect">Processing completed. Your video here: <a href="'+e.data+'">'+e.data+'</a></span>'+'\n');
			setTimeout(function() {
				window.location = e.data;
			}, 3000);
		});
	});
	
	if ($form.length) {
		if ($input.val() !== "") { $form.submit(); }
	}
});