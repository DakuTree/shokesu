module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		//Convert LESS to CSS.
		less: {
			development: {
				options: {
					paths: ["assets/css"]
				},
				files: {"assets/css/main.css": "assets/css/main.less"}
			},
			production: {
				options: {
					paths: ["assets/css"],
					cleancss: true
				},
				files: {"assets/css/main.css": "assets/css/main.less"}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.registerTask('default', ['less']);
};
