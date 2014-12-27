var through2 		= require('through2'),
gutil				= require('gulp-util'),
SVGSpriter			= require('svg-sprite'),
PluginError			= gutil.PluginError;

const PLUGIN_NAME	= 'gulp-svg-sprite';

/**
 * Plugin level function
 * 
 * @param {Object} config		SVGSpriter main configuration
 */
function gulpSVGSprite(config) {
	var spriter		= new SVGSpriter(config);
	
	return through2.obj(function (file, enc, cb) {
		spriter.add(file);
		cb(null);
		
	}, function(cb) {
		var stream 	= this;
		spriter.compile(function(error, result, data){
			for (var mode in result) {
				for (var resource in result[mode]) {
					var file		= result[mode][resource];
					stream.push(file);
				}
			}
			cb(null);
		})
	});
}

module.exports		= function(config) {
	return gulpSVGSprite(config);
}