module.exports = function(grunt){
	'use strict';
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		/* VERSIONING */

		now: grunt.template.today('yyyymmdd'),

		/* BOWER */
		bower: {
			install: {
				options: {
					targetDir: './files/vendor',  // A directory where you want to keep your Bower packages.
					cleanup: true,                // Will clean target and bower directories.
					layout: 'byComponent',        // Folder structure type.
					verbose: true,                // Debug output.
				},
			},
		},

		/* LESS */
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

	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('default', ['less']);
};
