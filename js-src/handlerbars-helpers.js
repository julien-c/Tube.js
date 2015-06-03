App = App || {};
App.Helpers = App.Helpers || {};

App.Helpers.pad2 = function(number) {
	return (number < 10 ? '0' : '') + number;
};

Handlebars.registerHelper('formatRate', function(rate) {
	if (rate >= 1024 * 1024) {
		return (rate/(1024*1024)).toFixed(2) + ' MB/s';
	}
	if (rate >= 1024) {
		return (rate/1024).toFixed(2) + ' kB/s';
	}
	return rate + ' B/s';
});

Handlebars.registerHelper('formatEta', function(eta) {
	if (eta === -1 || eta < 0) { return ''; }
	if (eta >= 3600) {
		return Math.floor(eta / 3600) + 'h' + App.Helpers.pad2(Math.floor((eta % 3600)/60)) + 'm';
	}
	if (eta >= 60) {
		return Math.floor(eta / 60) + 'm' + App.Helpers.pad2(eta % 60) + 's';
	}
	return eta + 's';
});
