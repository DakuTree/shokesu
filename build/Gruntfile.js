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

		/*----------------------------------( ARCHIVE )----------------------------------*/

		compress: {
			main: {
				options: {
					archive: './files/data/sites/<%=site_name%>/misc/<%=site_name%>-imgarchive.zip'
				},
				files: [
					{
						expand: true,
						flatten: true,
						cwd: './files/data/sites/<%=site_name%>/img/',
						src: ['*.{jpg,png,bmp,gif}', '!README', '!sample-*'],
						dest: '/',
						filter: 'isFile'
					}
				]
			}
		},

		/*----------------------------------( WATCH )----------------------------------*/

		watch: {
			files: [
				'./files/main.less',
				'./files/templates/**/*',
			],
			tasks: ['default'],
		},

		/*----------------------------------( ENV )----------------------------------*/

		env: {
			dev:  { NODE_ENV: 'DEVELOPMENT' },
			prod: {	NODE_ENV: 'PRODUCTION'  },
		},

		/*----------------------------------( CLEAN )----------------------------------*/

		clean: {
			options: {
				force: true, // Allows for deletion of folders outside current working dir (CWD). Use with caution.
			},
			dev:  ['../dev/**/*' ],
			prod: ['../prod/**/*']
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

					DATE: (new Date().getFullYear())+'-'+("0" + (new Date().getMonth() + 1)).slice(-2),

					/**Post functions**/
					//FIXME: This is currently not built for multiple differnt kinds of posts.
					//TODO: This should better support languages. EN & JP always exist, CN & KR are optional.
					//      Currently everything is just being defaulted to EN
					//FIXME: Currently date has to be checked if it's an array. Unsure if this is a preprocess or grunt bug.
					getPostFilename: function(date) {
						if(date instanceof Array) date = date[0];
						var post = grunt.config.get('postData')['posts'][date];

						var info = post['sample_filename'] || post['filename'];

						return info;
					},
					getPostImageElement: function (date) {
						if(date instanceof Array) date = date[0];
						var post = grunt.config.get('postData')['posts'][date];
						return '<a href="assets/img/'+post['filename']+'">'+
							       '<img id="image" src="assets/img/'+(post['filename_sample'] || post['filename'])+'" alt="'+encodeURI(post['title_en'] || post['title_jp'] || '[No Title]')+'" />'+
								'</a>';
					},
					getPostTitle: function(date) {
						if(date instanceof Array) date = date[0];
						var post = grunt.config.get('postData')['posts'][date];

						var title = post['title_en'] || post['title_jp'] || '[No Title]';
						if(post['url'] !== "") {
							title = '<a href="'+post['url']+'">'+title+'</a>';
						}

						return title;
					},
					getPostArtist: function(date) {
						if(date instanceof Array) date = date[0];
						var post   = grunt.config.get('postData')['posts'][date],
						    artist = grunt.config.get('postData')['artists'][post['artist']];

						return artist['name_en'];
					},
					getPostArtistNote: function(date) {
						if(date instanceof Array) date = date[0];
						var post   = grunt.config.get('postData')['posts'][date],
						    artist = grunt.config.get('postData')['artists'][post['artist']];

						var artist_note = artist['note_en'];
						//Put note in pre block. Make sure new lines also have pre block.
						artist_note = artist_note.replace(/\n*(.+)\n*/g, '\t\t\t\t\t\t\t\t\t<pre>$1</pre>');
						artist_note = artist_note.trim(); //teim extra tabs from first line.

						return artist_note;
					},
					getPostArtistLinks: function(date) {
						if(date instanceof Array) date = date[0];
						var post   = grunt.config.get('postData')['posts'][date],
						    artist = grunt.config.get('postData')['artists'][post['artist']];

						var artist_links = artist['urls'],
						    links_arr = [];
						Object.keys(artist_links).forEach(function(key) {
							//NOTE: These <a> URLs have no text as it is added via CSS.
							links_arr.push('<li><span class="a-'+key.replace('+', 'plus')+'"><span id="langText"></span><a href="'+artist_links[key]+'"></a></span></li>');
						});

						var link_html = links_arr.join('\n\t\t\t\t\t\t\t\t\t\t');
						return link_html;
					},
					getPostRandomFilename: function() {
						var posts = grunt.config.get('postData')['posts'],
						    keys = Object.keys(posts);

						var randomDate = keys[Math.floor(Math.random() * keys.length)],
						    randomPost = posts[randomDate];

						return randomPost['sample_filename'] || randomPost['filename'];
					},
					getPostHistory: function() {
						var posts = grunt.config.get('postData')['posts'],
						    keys = Object.keys(posts);

						var historyArr = {},
						    historyYears = [];
						if(grunt.config.get('site_name') !== 'holo.moe') {
							keys.forEach(function(e) {
								var year = e.substr(0, 4);
								if(typeof historyArr[year] === "undefined"){
									historyArr[year] = [];
									historyYears.push(year);
								}

								historyArr[year].push('\t\t\t\t\t\t<p><a href="./'+e+'.html">Month '+e.substr(5)+'</a></p>\n');
							});
						} else {
							//holo.moe is an irregular case due to it originally being a weekly update thing, rather than monthly.
							historyArr = {"2014": ["\t\t\t\t\t\t<p>Week 1-29</p>\n"]};
							historyYears.push("2014");
							keys.forEach(function(e) {
								var year = e.substr(0, 4);
								if(typeof historyArr[year] === "undefined"){
									historyArr[year] = [];
									historyYears.push(year);
								}

								historyArr[year].push('\t\t\t\t\t\t<p><a href="./'+e+'.html">'+(year == '2014' ? "Week" : "Month")+' '+e.substr(5)+'</a></p>\n');
							});
						}

						var history_html = "";
						historyYears.forEach(function(year) {
							history_html += "<div id='history-"+year+"'>\n\t\t\t\t\t\t<h2>"+year+"</h2>\n";
							historyArr[year].forEach(function(e) { history_html += e; });
							history_html += "\t\t\t\t\t</div>\n\t\t\t\t\t";
						});

						return history_html;
					},
					/* http://www.mikedoesweb.com/2014/javascript-object-next-and-previous-keys/ */
					getPostPrev: function(date) {
						if(date instanceof Array) date = date[0];
						var posts = grunt.config.get('postData')['posts'];

						var keys = Object.keys(posts);

						var idIndex = keys.indexOf(date);
						var prevIndex = (idIndex - 1);

						var prevLink = "<span>&nbsp;</span>";
						if(idIndex !== 0) {
							var prevKey = keys[prevIndex];
							prevLink = '<a href="'+prevKey+'.html">&larr;</a>';
						}

						return prevLink;
					},
					getPostNext: function(date) {
						if(date instanceof Array) date = date[0];
						var posts = grunt.config.get('postData')['posts'];

						var keys = Object.keys(posts);
						var idIndex = keys.indexOf(date);
						var nextIndex = (idIndex + 1);

						var nextLink = "<span>&nbsp;</span>";
						if(nextIndex < keys.length){
							var nextKey = keys[nextIndex];
							nextLink = '<a href="'+nextKey+'.html">&rarr;</a>';
						}

						return nextLink;

					},
				},
			},

			dev: {
				files: [
					{
						expand: true,
						cwd: './files/templates/',
						src: [
							'index.html',
							'history.html',
							'about.html',
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
							'history.html',
							'about.html',
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
							'main.less',
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
							'data/sites/<%=site_name%>/img/*.*'
						],
						dest: '../dev/assets/img/'
					},
					{
						expand: true,
						flatten: true,
						cwd: './files/',
						src: [
							'misc/*',
							'misc/.htaccess',
							'data/sites/<%=site_name%>/misc/*'
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
							'data/sites/<%=site_name%>/img/*.*'
						],
						dest: '../prod/assets/img/'
					},
					{
						expand: true,
						flatten: true,
						cwd: './files/',
						src: [
							'misc/*',
							'misc/.htaccess',
							'data/sites/<%=site_name%>/misc/*'
						],
						dest: '../prod/'
					}
				],
			},
		},

		/*----------------------------------( OPEN )----------------------------------*/
		open : {
			prod : {
				path : '<%=base_url%>'
			}
		},
		/*----------------------------------( FTP )----------------------------------*/
		// Be sure to update the auth.host property to your hostname and update
		// the .ftppass file with your FTP credentials
		ftpush : {
			build : {
				auth : {
					// These are all set via site settings.json
					// host : '',
					// port : 21,
					// authKey : ''
				},
				src : '../prod/',
				dest : '/',
				simple : true,
				exclusions : ['**.DS_Store']
			}
		},

		/*----------------------------------( robots.txt generation )----------------------------------*/
		robotstxt: {
			dist: {
				//this module is a bit buggy, and sometimes doesn't add new lines
				dest: 'files/data/sites/<%=site_name%>/misc/',
				policy: [
					{
						host: '<%=base_url%>'
					},
					{
						crawldelay: 100
					},
					{
						sitemap: '<%=base_url%>/sitemap.xml\n\n' //newline is required since ua seems to eat prior \n
					},
					{
						ua: '*',
						allow: ['index.html', 'about.html', 'history.html'],
						disallow: '/'
					}
				]
			}
		},

		xml_sitemap: {
			main: {
				//FIX: sitemap module lacks per file options :|
				options: {
					changefreq: 'weekly',
					dest: 'files/data/sites/<%=site_name%>/misc/',
					fileName: 'sitemap',
					siteRoot: '<%=base_url%>',
					// lastMod: '<%=now%>',
					priority: '0.8'
				},
				files: [
					{
						expand: false,
						flatten: true,
						cwd: '../dev/',
						src: [
							'**/*.html',
							'!posts/*'
						]
					},
					{
						//everything in posts/ is rewritten to root url, so we need to trick the module to make it do that..
						expand: false,
						flatten: true,
						cwd: '../dev/posts/',
						src: [
							'*.html'
						]
					},
				]
			}
		},

		image_resize: {
			main: {
				options: {
					width: '', //no resize
					height: '', //no resize
					overwrite: true,
					quality: 0.94
				},
				files : {}
				//files are added via sample_images task
			}
		}
	});

	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-rename');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-preprocess');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-ftpush');
	grunt.loadNpmTasks('grunt-open');
	grunt.loadNpmTasks('grunt-robots-txt');
	grunt.loadNpmTasks('grunt-xml-sitemap');
	grunt.loadNpmTasks('grunt-image-resize');

	//----------------------------------

	/**
	 * @see https://github.com/onehealth/grunt-preprocess/issues/7
	 * @see https://github.com/onehealth/grunt-env/issues/4
	 */

	grunt.registerTask('printenv', function () { console.log(process.env); });

	//----------------------------------

	grunt.registerTask('setup_env', 'Setup enviroment depending on ARG.', function(name, val) {
		var fs = require('fs'),
		    path = require('path');

		/**get site from ARG**/
		var siteList = getDirectories("files/data/sites/"),
		    target = grunt.option('site');
		if(!target) {
			grunt.fail.fatal("site needs to be specified as an arg (I.E: --site=holo.moe)", 0);
		} else if(siteList.indexOf(target) === -1) {
			//site does not exist within siteList
			grunt.fail.fatal("'"+target+"' does not exist within siteList.\nDid you make sure to create a folder in data/sites?", 0);
		}

		/** Apply settings.json to preprocess context **/
		var jsonFile = "files/data/sites/"+target+"/settings.json";
		if(!grunt.file.exists(jsonFile)) {
			grunt.fail.fatal("settings.json does not exist in "+jsonFile);
		} else {
			var jsonDefaults = {
				"site_name" : "",
				"base_url"  : "",

				"site_title"       : "",
				"site_comment"     : "",
				"site_description" : "",
				"site_keywords"    : "",

				"about_media"     : "",
				"about_thanks"    : "",
				"about_copyright" : "",

				"google_analytics_id" : "",

				"ftp_host"    : "",
				"ftp_port"    : "",
				"ftp_authkey" : ""
			};
			var json = merge_options(jsonDefaults, grunt.file.readJSON(jsonFile));

			//preprocess settings
			Object.keys(json).forEach(function(k) {
				grunt.config.set('preprocess.options.context.'+k, json[k]);
			});
			//extra settings
			grunt.config.set('site_name', json['site_name']);
			grunt.config.set('base_url', json['base_url']);

			grunt.config.set('ftpush.build.auth.host',    json['ftp_host']);
			grunt.config.set('ftpush.build.auth.port',    json['ftp_port']);
			grunt.config.set('ftpush.build.auth.authKey', json['ftp_authkey']);
		}

		//http://stackoverflow.com/a/24594123
		function getDirectories(srcpath) {
			return fs.readdirSync(srcpath).filter(function(file) {
				return fs.statSync(path.join(srcpath, file)).isDirectory();
			});
		}
		//http://stackoverflow.com/a/171256
		function merge_options(obj1,obj2){
			var obj3 = {};
			for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
			for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
			return obj3;
		}
	});

	grunt.registerTask('load_posts', 'Compile posts.json & artists/*.json', function(name, val) {
		/* This is mostly a rewritten grunt-concat-json */
		var stripJsonComments = require("strip-json-comments");
		var jsonlint = require("jsonlint");

		var json = {};
		grunt.file.expand({}, ["files/data/artists/*.json", "files/data/sites/"+grunt.config.get('site_name')+"/posts.json"]).forEach(function(f) {
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

						// Remove the path to the container, and the .json extension
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
								//posts

								_currentDir[path] = fragment.json;
							} else {
								//artists
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

		//Remove posts after current month. Avoids pushing later posts until actual month.
		//TODO: Make it possible to push posts without having them be accessable on site until actual month.
		//      This probably isn't possible outside of messing with .htaccess / PHP.
		//CHECK: Is the most efficent way of doing this? It feels clunky.
		Object.keys(json['posts']).forEach(function(p){
			if((new Date(grunt.config.get('preprocess.options.context.DATE'))).getTime() < (new Date(p)).getTime()) {
				delete json['posts'][p];
			}
		});

		grunt.file.write('files/data/sites/'+grunt.config.get('site_name')+'/compiled.json', JSON.stringify(json, null, '\t'));
		grunt.config.set('postData', json);

		var pp_dev  = grunt.config.get('preprocess.dev.files');
		var pp_prod = grunt.config.get('preprocess.prod.files');
		for(var k in json['posts']) {
			var devObj = {
				options: {
					context: {
						'DATE': k
					}
				},

				src:  './files/templates/index.html',
				dest: '', //changed below
			};
			var prodObj = JSON.parse(JSON.stringify(devObj)); //JS is stupid.

			devObj['dest']  = '../dev/posts/'+k+'.html';
			pp_dev.push(devObj);

			prodObj['dest'] = '../prod/posts/'+k+'.html';
			pp_prod.push(prodObj);
		}
		grunt.config.set('preprocess.dev.files',  pp_dev);
		grunt.config.set('preprocess.prod.files', pp_prod);
	});

	grunt.registerTask('generate_samples', 'Generate sample images if needed.', function(name, val) {
		var fs = require("fs");

		var sampleImages = {};
		var postsData = grunt.config.get('postData');
		Object.keys(postsData['posts']).forEach(function(post) {
			var stats = fs.statSync('files/data/sites/'+grunt.config.get('site_name')+'/img/'+postsData['posts'][post]['filename']);

			//if image > 1MB, generate sample
			if((stats['size'] / 1000000) > 1) {
				var sampleFilename = postsData['posts'][post]['filename'].replace(/\.png/, '.jpg'); //PNG is the main cause of big filesizes.
				sampleImages['files/data/sites/'+grunt.config.get('site_name')+'/img/'+sampleFilename] = 'files/data/sites/'+grunt.config.get('site_name')+'/img/'+postsData['posts'][post]['filename'];
				postsData['posts'][post]['filename_sample'] = sampleFilename;
			}
		});
		grunt.config.set('postData', postsData);
		grunt.config.set('image_resize.main.files', sampleImages);

		grunt.task.run('image_resize');
	});

	grunt.registerTask('init', ['setup_env', 'load_posts', 'generate_samples', 'compress', 'robotstxt']);
	grunt.registerTask('update', ['bower', 'rename']);
	grunt.registerTask('dev', ['init', 'env:dev', 'clean:dev', 'preprocess:dev', 'xml_sitemap', 'copy:dev']);
	grunt.registerTask('prod', ['dev', 'env:prod', 'clean:prod', 'less:prod', 'cssmin:prod', 'preprocess:prod', 'copy:prod']);
	grunt.registerTask('deploy', ['prod', 'ftpush', 'open:prod']);
	grunt.registerTask('default', ['dev']);

};
