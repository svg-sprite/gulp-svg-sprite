'use strict';

/**
 * gulp-svg-sprite is a Gulp plugin for creating SVG sprites
 *
 * @see https://github.com/jkphl/gulp-svg-sprite
 *
 * @author Joschi Kuphal <joschi@kuphal.net> (https://github.com/jkphl)
 * @copyright © 2018 Joschi Kuphal
 * @license MIT https://github.com/svg-sprite/gulp-svg-sprite/blob/main/LICENSE
 */

/** @typedef {import('stream').TransformOptions} TransformOptions */

const { Transform } = require('stream');
const { format } = require('util');
const PluginError = require('plugin-error');
const SVGSpriter = require('svg-sprite');

const PLUGIN_NAME = 'gulp-svg-sprite';

/**
 * Get a new Transform stream set in Object mode, similar to through2#obj.
 * Inspired by [metafizzy/transfob](https://github.com/metafizzy/transfob).
 * @param {TransformOptions['transform']} transform
 * @param {TransformOptions['flush']} flush
 */
function transfob(transform, flush) {
    return new Transform({
        flush,
        transform,
        objectMode: true
    });
}

// Extend plugin error
function createExtendedPluginError(...args) {
    const error = args.find(a => a instanceof Error);
    let { message } = error;

    if (args.length > 1 && typeof args[0] === 'string') {
        message = format(...args);
    }

    const pluginError = new PluginError(PLUGIN_NAME, message || 'Unspecified error');
    if (error) {
        pluginError.name = error.name;
    }

    return pluginError;
}

/**
 * Plugin level function
 *
 * @param {Object} config           SVGSpriter main configuration
 */
function gulpSVGSprite(config) {
    // Instantiate spriter instance
    const spriter = new SVGSpriter(config);
    let shapes = 0;

    // Intercept error log and convert to plugin errors
    spriter.config.log.error = function(...args) {
        this.emit('error', createExtendedPluginError(...args));
    };

    return transfob((file, encoding, callback) => {
        let error = null;
        try {
            spriter.add(file);
            ++shapes;
        } catch (error_) {
            error = (!error_.plugin || (error_.plugin !== PLUGIN_NAME)) ?
                createExtendedPluginError(error_) :
                error_;
        }

        return callback(error);
    }, function(callback) {
        spriter.compile((error, result) => {
            if (error) {
                this.emit('error', new PluginError(PLUGIN_NAME, error));
            } else if (shapes > 0) {
                for (const mode of Object.values(result)) {
                    for (const resource of Object.values(mode)) {
                        this.push(resource);
                    }
                }
            }

            callback();
        });
    });
}

module.exports = gulpSVGSprite;
