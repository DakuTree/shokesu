run:
	npm install
	grunt update
	grunt prod


notes:
	node_modules\grunt-preprocess\tasks\preprocess.js must be editted:
		to allow setting context per file, this needed to be changed

		replace this (around line 58):
			context.srcDir = path.dirname(src);
			var processed = preprocess.preprocess(srcText, context, getExtension(src));
		with this:
			context.srcDir = path.dirname(src);
			var tmp_context = context;
			if(fileObj.options && fileObj.options.context) tmp_context = _.merge(context, fileObj.options.context);
			var processed = preprocess.preprocess(srcText, tmp_context, getExtension(src));
