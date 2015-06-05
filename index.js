'use strict';

/**
 * gulp-svg-sprite is a Gulp plugin for creating SVG sprites
 *
 * @see https://github.com/jkphl/gulp-svg-sprite
 *
 * @author Joschi Kuphal <joschi@kuphal.net> (https://github.com/jkphl)
 * @copyright © 2015 Joschi Kuphal
 * @license MIT https://raw.github.com/jkphl/gulp-svg-sprite/master/LICENSE.txt
 */

var through2 						= require('through2'),
	gutil							= require('gulp-util'),
	SVGSpriter						= require('svg-sprite'),
	PluginError						= gutil.PluginError,

	PLUGIN_NAME						= 'gulp-svg-sprite';

/**
 * Plugin level function
 *
 * @param {Object} config			SVGSpriter main configuration
 */
function gulpSVGSprite(config) {

	// Extend plugin error
	function extendError(pError, error) {
		if (error && (typeof error === 'object')) {
			['name', 'errno'].forEach(function(property) {
				if (property in error) {
					this[property]	= error[property];
				}
			}, pError);
		}

		return pError;
	}

	// Instanciate spriter instance
	var spriter						= new SVGSpriter(config);
	var shapes						= 0;

	// Intercept error log and convert to plugin errors
	spriter.config.log.error		= function(message, error) {
		this.emit('error', extendError(new PluginError(PLUGIN_NAME, message), error));
	};

	return through2.obj(function (file, enc, cb) {
		var error					= null;
		try {
			spriter.add(file);
			++shapes;
		} catch(e) {
			error					= (!e.plugin || (e.plugin !== PLUGIN_NAME)) ? extendError(new PluginError(PLUGIN_NAME, e.message), e) : e;
		}
		return cb(error);

	}, function(cb) {
		var stream 					= this;
		spriter.compile(function(error, result /*, data*/){
			if (error) {
				stream.emit('error', new PluginError(PLUGIN_NAME, error));
			} else if (shapes > 0) {
				for (var mode in result) {
					for (var resource in result[mode]) {
						stream.push(result[mode][resource]);
					}
				}
			}
			cb();
		});
	});
}

module.exports			= gulpSVGSprite;
