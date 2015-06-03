module.exports = function(grunt){
	'use strict';
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		now: grunt.template.today('yyyymmdd'),

		//Convert LESS to minified CSS.
		less: {
			build: {
				options: {
					cleancss: true,
					compress: true
				},
				files: {"assets/_/main-<%= now %>.css": "assets/main.less"}
			}
		},

		//Autorun grunt on file change
		watch: {
			files: [
				"assets/main.less",
				"assets/main.js",
				"data/*.json"
			],
			tasks: ['default']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.registerTask('default', ['less']);
};
