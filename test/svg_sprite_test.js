'use strict';

/*jshint expr: true*/
/*global describe, it */

/**
 * gulp-svg-sprite is a Gulp plugin for creating SVG sprites
 *
 * @see https://github.com/jkphl/gulp-svg-sprite
 *
 * @author Joschi Kuphal <joschi@kuphal.net> (https://github.com/jkphl)
 * @copyright © 2014 Joschi Kuphal
 * @license MIT https://raw.github.com/jkphl/gulp-svg-sprite/master/LICENSE.txt
 */

var fs = require('pn/fs'); // https://www.npmjs.com/package/pn
var svg2png = require('svg2png');
var path = require('path');
var imageDiff = require('image-diff');
var mkdirp = require('mkdirp');
var should = require('should');
var glob = require('glob');

require('mocha');

delete require.cache[require.resolve('../')];

var gutil = require('gulp-util'),
    gulpSvgSprite = require('../'),
    orthogonal = {
//		log					: 'debug',
        mode: {
            css: {
                layout: 'vertical',
                sprite: '../svg/vertical.svg',
                render: {
                    css: true,
                    scss: true,
                    less: true,
                    styl: true
                },
                bust: false
            },
            view: {
                layout: 'horizontal',
                sprite: '../svg/horizontal.svg',
                bust: false
            },
            defs: {
                sprite: '../svg/defs.svg'
            },
            symbol: {
                sprite: '../svg/symbol.svg'
            },
            stack: {
                sprite: '../svg/stack.svg'
            }
        }
    },
    others = {
        shape: {
            dest: 'intermediate'
        },
        mode: {
            css: {
                layout: 'diagonal',
                sprite: '../svg/diagonal.svg',
                bust: false
            },
            view: {
                layout: 'packed',
                sprite: '../svg/packed.svg',
                bust: false
            }
        }
    },
    cwd = path.join(__dirname, 'fixtures'),
    dest = path.normalize(path.join(__dirname, '..', 'tmp'));

/**
 * Prepare and output a file and create directories as necessary
 *
 * @param {String} file                File
 * @param {String} content            Content
 * @return {String}                    File
 */
function writeFile(file, content) {
    try {
        mkdirp.sync(path.dirname(file));
        fs.writeFileSync(file, content);
        return file;
    } catch (e) {
        return null;
    }
}

/**
 * Rasterize an SVG file and compare it to an expected image
 *
 * @param {String} svg                SVG file path
 * @param {String} png                PNG file path
 * @param {String} expected            Expected PNG file path
 * @param {String} diff                Diff file path
 * @param {Function} done            Callback
 * @param {String} msg              Message
 */
function compareSvg2Png(svg, png, expected, diff, done, msg) {
    mkdirp.sync(path.dirname(png));
    var ecb = function (err) {
        console.log(err);
        should(err).not.ok;
        done();
    };
    fs.readFile(svg)
        .then(svg2png)
        .then(function (buffer) {
            fs.writeFile(png, buffer)
                .then(function () {
                    imageDiff({
                        actualImage: png,
                        expectedImage: expected,
                        diffImage: diff
                    }, function (err, imagesAreSame) {
                        should(err).not.ok;
                        should.ok(imagesAreSame, msg);
                        done();
                    });
                })
                .catch(ecb);
        })
        .catch(ecb);
}

describe('gulp-svg-sprite', function () {
    describe('with orthogonal configuration', function () {
        var stream = gulpSvgSprite(orthogonal),
            result = 0;

        it('should produce 9 files', function (done) {
            this.timeout(20000);

            stream.on('error', function (err) {
                should.exist(err);
                done(err);
            });

            stream.on('data', function (file) {
                should.exist(file);
                should.exist(file.contents);
                writeFile(path.join(dest, file.relative), file.contents);
                ++result;
            });

            stream.on('end', function () {
                result.should.be.exactly(9);
                done();
            });

            glob.glob.sync('weather*.svg', {cwd: cwd}).forEach(function (file) {
                stream.write(new gutil.File({
                    path: path.join(cwd, file),
                    cwd: cwd,
                    base: cwd,
                    contents: fs.readFileSync(path.join(cwd, file))
                }));
            });

            stream.end();
        });

        it('should match vertical sprite', function (done) {
            this.timeout(20000);
            compareSvg2Png(
                path.join(__dirname, '..', 'tmp', 'svg', 'vertical.svg'),
                path.join(__dirname, '..', 'tmp', 'png', 'vertical.png'),
                path.join(__dirname, 'expected', 'vertical.png'),
                path.join(__dirname, '..', 'tmp', 'diff', 'vertical.png'),
                done,
                'The vertical sprite doesn\'t match the expected one!'
            );
        });

        it('should match horizontal sprite', function (done) {
            this.timeout(20000);
            compareSvg2Png(
                path.join(__dirname, '..', 'tmp', 'svg', 'horizontal.svg'),
                path.join(__dirname, '..', 'tmp', 'png', 'horizontal.png'),
                path.join(__dirname, 'expected', 'horizontal.png'),
                path.join(__dirname, '..', 'tmp', 'diff', 'horizontal.png'),
                done,
                'The horizontal sprite doesn\'t match the expected one!'
            );
        });
    });

    describe('with alternative configuration', function () {
        var stream = gulpSvgSprite(others),
            result = 0;

        it('should produce 13 files', function (done) {
            this.timeout(20000);

            stream.on('error', function (err) {
                should.exist(err);
                done(err);
            });

            stream.on('data', function (file) {
                should.exist(file);
                should.exist(file.contents);
                writeFile(path.join(dest, file.relative), file.contents);
                ++result;
            });

            stream.on('end', function () {
                result.should.be.exactly(13);
                done();
            });

            glob.glob.sync('weather*.svg', {cwd: cwd}).forEach(function (file) {
                stream.write(new gutil.File({
                    path: path.join(cwd, file),
                    cwd: cwd,
                    base: cwd,
                    contents: fs.readFileSync(path.join(cwd, file))
                }));
            });

            stream.end();
        });

        it('should match diagonal sprite', function (done) {
            this.timeout(20000);
            compareSvg2Png(
                path.join(__dirname, '..', 'tmp', 'svg', 'diagonal.svg'),
                path.join(__dirname, '..', 'tmp', 'png', 'diagonal.png'),
                path.join(__dirname, 'expected', 'diagonal.png'),
                path.join(__dirname, '..', 'tmp', 'diff', 'diagonal.png'),
                done,
                'The diagonal sprite doesn\'t match the expected one!'
            );
        });

        it('should match packed sprite', function (done) {
            this.timeout(20000);
            compareSvg2Png(
                path.join(__dirname, '..', 'tmp', 'svg', 'packed.svg'),
                path.join(__dirname, '..', 'tmp', 'png', 'packed.png'),
                path.join(__dirname, 'expected', 'packed.png'),
                path.join(__dirname, '..', 'tmp', 'diff', 'packed.png'),
                done,
                'The packed sprite doesn\'t match the expected one!'
            );
        });
    });
});
