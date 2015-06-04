module.exports = function(grunt){
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		/*----------------------------------( VERSIONING )----------------------------------*/

		now: grunt.template.today('yyyymmdd'),

		/*----------------------------------( BOWER )----------------------------------*/

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

		/*----------------------------------( RENAME )----------------------------------*/

		//Because bower doesn't allow you to rename files :<
		rename: {
			moveThat: {
				src:  './files/vendor/css/main.css',
				dest: './files/vendor/css/boilerplate.css'
			}
		},

		/*----------------------------------( WATCH )----------------------------------*/

		watch: {
			files: [
				'./files/main.less',
				'./files/main.js',
				'./files/templates/**/*',
			],
			tasks: ['default'],
		},

		/*----------------------------------( ENV )----------------------------------*/

		env: {
			dev: {
				NODE_ENV: 'DEVELOPMENT',
			},
			prod: {
				NODE_ENV: 'PRODUCTION',
			},
		},

		/*----------------------------------( CLEAN )----------------------------------*/

		clean: {
			options: {
				force: true, // Allows for deletion of folders outside current working dir (CWD). Use with caution.
			},
			dev: [
				'../dev/**/*'
			],
			prod: [
				'../prod/**/*'
			]
		},

		/*----------------------------------( LESS )----------------------------------*/

		less: {
			prod: {
				options: {
					cleancss: true,
					compress: true
				},
				files: {"../prod/assets/main.css": "files/main.less"} /* There should be some cache control here */
			}
		},

		/*----------------------------------( CSSMIN )----------------------------------*/

		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: 14
			},
			prod: {
				files: [{
					expand: true,
					cwd: './files/vendor/css/',
					src: ['*.css', '!*.min.css'],
					dest: './files/vendor/css/',
					ext: '.min.css'
				}]
			}
		},

		/*----------------------------------( PREPROCESS )----------------------------------*/

		preprocess: {
			options: {
				context: {
					description: '<%= pkg.description %>',
					homepage: '<%= pkg.homepage %>',
					license: '<%= _.pluck(pkg.licenses, "type").join(", ") %>',
					name: '<%= pkg.name %>',
					now: '<%= now %>',
					production: '<%= pkg.production %>',
					title: '<%= pkg.title %>',
					ver: '<%= ver %>',
					version: '<%= pkg.version %>',

					google_analytics_id: "'UA-30896979-2'"
				},
			},

			dev: {
				files: [
					{
						expand: true,
						cwd: './files/templates/',
						src: [
							'index.html',
							'!includes/**/*'
						],
						dest: '../dev/',
					},
				],
			},
			prod: {
				files: [
					{
						expand: true,
						cwd: './files/templates/',
						src: [
							'index.html',
							'!includes/**/*'
						],
						dest: '../prod/',
					}
				],
			},
		},

		/*----------------------------------( COPY )----------------------------------*/

		copy: {
			dev: {
				files: [
					{
						expand: true,
						cwd: './files/',
						src: [
							'img/*.*',
							'main.less',
							'main.js',
							'vendor/**/*.*',
							'!vendor/**/*.min.css'
						],
						dest: '../dev/assets/'
					},
					{
						expand: true,
						flatten: true,
						cwd: './files/',
						src: [
							'misc/*'
						],
						dest: '../dev/'
					}
				],
			},
			prod: {
				files: [
					{
						expand: true,
						cwd: './files/',
						src: [
							'img/*.*',
							'main.js',
							'vendor/**/*.min.*'
							//'main.css' //main.css already exists in prod
						],
						dest: '../prod/assets/'
					},
					{
						expand: true,
						flatten: true,
						cwd: './files/',
						src: [
							'misc/*'
						],
						dest: '../prod/'
					}
				],
			},
		},
	});

	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-rename');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-preprocess');
	grunt.loadNpmTasks('grunt-contrib-copy');

	//----------------------------------

	/**
	 * @see https://github.com/onehealth/grunt-preprocess/issues/7
	 * @see https://github.com/onehealth/grunt-env/issues/4
	 */

	grunt.registerTask('printenv', function () { console.log(process.env); });

	//----------------------------------


	grunt.registerTask('load_posts', 'Load posts.json', function(name, val) {
		/* This is mostly a rewritten grunt-concat-json */
		var stripJsonComments = require('strip-json-comments');
		var jsonlint = require("jsonlint");

		var json = {};
		grunt.file.expand({}, ["files/data/**/*.json", "!files/data/compiled.json"]).forEach(function(f) {
			try {
				if (!grunt.file.exists(f)) {
					throw "JSON source file "+f+" not found.";
				} else {
					var fragment;

					try {
						var withComments = grunt.file.read(f),
						    without = stripJsonComments(withComments),
						    linted = jsonlint.parse(without);

						fragment = {
							dir: '',
							// Attach comment-less JSON
							json: linted
						};

						// Start a top level
						var currentDir = json;

						// Remove the path to the contianer, and the .json extension
						var path = f.replace(f.base + '/', '').replace('.json', '');

						var test = true;
						while (test) {
							var _path = path,
							    _currentDir = currentDir;

							if(!_currentDir['artists']) _currentDir['artists'] = {};
							if(!_currentDir['posts'])   _currentDir['posts'] = {};

							// If the is a slash, we have a parent folder
							var firstSlash = _path.lastIndexOf('/');
							if (firstSlash > -1) {
								path = _path.slice(firstSlash + 1);
								test = true;
								continue;
							}

							if(f.indexOf('artists') === -1) {
								_currentDir[path] = fragment.json;
							} else {
								_currentDir['artists'][path] = fragment.json;
							}
							test = false;
						}
					} catch (e)	{
						grunt.fail.warn(e);
					}
				}
			} catch (e)	{
				grunt.fail.warn(e);
			}
		});

		grunt.file.write('files/data/compiled.json', JSON.stringify(json, null, '\t'));
	});

	grunt.registerTask('init', ['load_posts']);
	grunt.registerTask('update', ['bower', 'rename']);
	grunt.registerTask('dev', ['init', 'env:dev', 'clean:dev', 'preprocess:dev', 'copy:dev']);
	grunt.registerTask('prod', ['init', 'dev', 'env:prod', 'clean:prod', 'less:prod', 'cssmin:prod', 'preprocess:prod', 'copy:prod']);
	grunt.registerTask('default', ['dev']);
};
