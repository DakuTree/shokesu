module.exports = function(grunt){
	'use strict';
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		/*----------------------------------( VERSIONING )----------------------------------*/

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
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('default', ['less']);
};
