# holo.moe
**[holo.moe](http://holo.moe)** is a personal project to showcase various media of the character Holo from Spice and Wolf.  
This is a re-write of the original site (which was poorly coded in PHP).

## how to build
* cd build/
* npm install
* grunt update
* grunt prod

### extra build notes:
node_modules\grunt-preprocess\tasks\preprocess.js must be edited to allow setting context per file.

replace this (around line 58):
> context.srcDir = path.dirname(src);  
> var processed = preprocess.preprocess(srcText, context, getExtension(src));

with this:
> context.srcDir = path.dirname(src);  
> var tmp_context = context;  
> if(fileObj.options && fileObj.options.context) tmp_context = _.merge(context, fileObj.options.context);  
> var processed = preprocess.preprocess(srcText, tmp_context, getExtension(src));

			
##thanks
See: [humans.txt](build/files/misc/humans.txt).
