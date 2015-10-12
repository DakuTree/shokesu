# Shōkēsu
**Shōkēsu** is a personal project to showcase various media of selected characters from anime/manga.  
It was originally built specifically for [holo.moe](http://holo.moe) (The repo was also called holo.moe!), but after grabbing another interesting domain, multi-site support was added & the name had to be changed.

#### Current Sites
* **[holo.moe](http://holo.moe)** - Holo from Spice and Wolf
* ~~**[????.moe](http://????.moe)** - ???~~

## how to build
* cd build/
* npm install
* grunt update
* grunt prod

#### extra build notes:
node_modules\grunt-preprocess\tasks\preprocess.js must be edited to allow setting context per file.

replace this (around line 58):
> context.srcDir = path.dirname(src);  
> var processed = preprocess.preprocess(srcText, context, getExtension(src));

with this:
> context.srcDir = path.dirname(src);  
> var tmp_context = context;  
> if(fileObj.options && fileObj.options.context) tmp_context = _.merge(context, fileObj.options.context);  
> var processed = preprocess.preprocess(srcText, tmp_context, getExtension(src));

## misc
* Originally, the site was hacked together using PHP. Moved to grunt due to wanting something completely static. Think it turned out well.
* The title is a simple ENG>JP>ROMAJI translation of "Showcase". (Romaji: Shōkēsu // JP: ショーケース)

## thanks
See: [humans.txt](build/files/misc/humans.txt).
