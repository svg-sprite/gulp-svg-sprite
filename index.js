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
function extendError(pError, error) {
    if (error && (typeof error === 'object')) {
        for (const property of ['name', 'errno']) {
            if (property in error) {
                pError[property] = error[property];
            }
        }
    }

    return pError;
}

/**
 * Plugin level function
 *
 * @param {Object} config           SVGSpriter main configuration
 */
function gulpSVGSprite(config) {
    // Instanciate spriter instance
    const spriter = new SVGSpriter(config);
    let shapes = 0;

    // Intercept error log and convert to plugin errors
    spriter.config.log.error = function(message, error) {
        this.emit('error', extendError(new PluginError(PLUGIN_NAME, message), error));
    };

    return transfob((file, encoding, callback) => {
        let error = null;
        try {
            spriter.add(file);
            ++shapes;
        } catch (e) {
            error = (!e.plugin || (e.plugin !== PLUGIN_NAME)) ?
                extendError(new PluginError(PLUGIN_NAME, e.message), e) :
                e;
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
