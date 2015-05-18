var _ = require('underscore');

module.exports = function(grunt) {
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	grunt.registerTask('default', ['jshint', 'uglify', 'concat', 'less']);
	
	var jsDependencies = [
		'bower_components/jquery/dist/jquery.js',
		'bower_components/underscore/underscore.js',
	];
	
	grunt.initConfig({
		jshint: {
			src: 'js-src/*.js'
		},
		uglify: {
			dist: {
				src: 'js-src/*.js',
				dest: 'static/js-src.min.js'
			}
		},
		concat: {
			options: {
				stripBanners: {block: true, line: true}
			},
			dist: {
				src: _.union(jsDependencies, ['static/js-src.min.js']),
				dest: 'static/script.min.js'
			}
		},
		less: {
			options: {
				compress: true
			},
			dist: {
				src: 'less/*.less',
				dest: 'static/style.min.css'
			}
		},
		watch: {
			default: {
				files: ['less/*', 'js-src/*'],
				tasks: 'default'
			},
			livereload: {
				options: { livereload: true },
				files: ['static/*', 'app.lock', 'views/*']
				// Livereload the Web page whenever:
				// - compiled assets change
				// - the node app restarts
				// - templates change
			}
		},
	});
	
};
