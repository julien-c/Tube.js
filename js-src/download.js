$(function() {
	var $form = $('form.download');
	var $input = $form.find('input[type="text"]');
	var $output = $('pre.output');
	
	var source;
	$form.submit(function(e) {
		e.preventDefault();
		$output.empty();
		if (typeof source !== 'undefined') {
			source.close();
		}
		source = new EventSource('/download/stream?url='+encodeURIComponent($input.val()));
		source.addEventListener('open', function(e) {
			$output.removeClass('hide');
		});
		source.addEventListener('command', function(e) {
			$output.append('<strong>$</strong> '+e.data+'\n');
		});
		source.addEventListener('message', function(e) {
			console.log(e.data);
			$output.append(e.data+'\n');
		});
		source.addEventListener('err', function(e) {
			$output.append('<span class="err">'+e.data+'</span>'+'\n');
		});
		source.addEventListener('redirect', function(e) {
			$output.append('\n'+'<span class="redirect">Processing completed. Your video here: <a href="'+e.data+'">'+e.data+'</a></span>'+'\n');
		});
	});
	
	if ($form.length) {
		if ($input.val() !== "") { $form.submit(); }
	}
});