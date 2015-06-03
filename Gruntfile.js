var _ = require('underscore');

module.exports = function(grunt) {
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-handlebars');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	grunt.registerTask('default', ['jshint', 'uglify', 'handlebars', 'concat', 'less']);
	
	var jsDependencies = [
		'bower_components/jquery/dist/jquery.js',
		'bower_components/underscore/underscore.js',
		'bower_components/handlebars/handlebars.runtime.min.js',
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
		handlebars: {
			options: {
				namespace: 'App.Templates',
				processName: function(filePath) {
					var pieces = filePath.split('/');
					var fileName = pieces[pieces.length - 1];
					return fileName.substr(0, fileName.lastIndexOf('.'));
				}
			},
			dist: {
				src: ['views/torrent.handlebars'],
				dest: 'static/templates.min.js'
			}
		},
		concat: {
			options: {
				stripBanners: {block: true, line: true}
			},
			dist: {
				src: _.union(jsDependencies, ['static/templates.min.js', 'static/js-src.min.js']),
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
