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

const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const svg2png = require('svg2png');
const looksSame = require('looks-same');
const glob = require('glob');
const Vinyl = require('vinyl');
const gulpSvgSprite = require('../index.js');

const orthogonal = {
    //log: 'debug',
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
};
const others = {
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
};
const cwd = path.join(__dirname, 'fixtures');
const dest = path.normalize(path.join(__dirname, '../tmp'));

/**
 * Prepare and output a file and create directories as necessary
 *
 * @param {String} file             File
 * @param {String} content          Content
 * @return {String}                 File
 */
function writeFile(file, content) {
    try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
        return file;
    } catch {
        return null;
    }
}

/**
 * Rasterize an SVG file and compare it to an expected image
 *
 * @param {String} svg                SVG file path
 * @param {String} png                PNG file path
 * @param {String} expected           Expected PNG file path
 * @param {String} diff               Diff file path
 * @param {Function} done             Callback
 * @param {String} msg                Message
 */
// eslint-disable-next-line max-params
function compareSvg2Png(svg, png, expected, diff, done, msg) {
    fs.mkdirSync(path.dirname(png), { recursive: true });

    const ecb = function(err) {
        console.log(err);
        assert.ifError(err);
        done();
    };

    fs.promises.readFile(svg)
        .then(svg2png)
        .then(buffer => {
            fs.promises.writeFile(png, buffer)
                .then(() => {
                    looksSame(png, expected, (err, result) => {
                        assert.ifError(err);
                        assert.ok(result.equal, `${msg} ${JSON.stringify(result.diffClusters)} ${png}`);
                        done();
                    });
                    looksSame.createDiff({
                        reference: expected,
                        current: png,
                        diff,
                        highlightColor: '#ff00ff'
                    }, () => {});
                })
                .catch(ecb);
        })
        .catch(ecb);
}

describe('gulp-svg-sprite', () => {
    describe('with orthogonal configuration', () => {
        const stream = gulpSvgSprite(orthogonal);
        let result = 0;

        it('should produce 9 files', done => {
            stream.on('error', err => {
                assert.notEqual(err, undefined);
                done(err);
            });

            stream.on('data', file => {
                assert.notEqual(file, undefined);
                assert.notEqual(file.contents, undefined);
                writeFile(path.join(dest, file.relative), file.contents);
                ++result;
            });

            stream.on('end', () => {
                assert.equal(result, 9);
                done();
            });

            for (const file of glob.sync('weather*.svg', { cwd })) {
                stream.write(new Vinyl({
                    path: path.join(cwd, file),
                    cwd,
                    base: cwd,
                    contents: fs.readFileSync(path.join(cwd, file))
                }));
            }

            stream.end();
        });

        it('should match vertical sprite', done => {
            compareSvg2Png(
                path.join(__dirname, '../tmp/svg/vertical.svg'),
                path.join(__dirname, '../tmp/png/vertical.png'),
                path.join(__dirname, 'expected/vertical.png'),
                path.join(__dirname, '../tmp/png/vertical.diff.png'),
                done,
                'The vertical sprite doesn\'t match the expected one!'
            );
        });

        it('should match horizontal sprite', done => {
            compareSvg2Png(
                path.join(__dirname, '../tmp/svg/horizontal.svg'),
                path.join(__dirname, '../tmp/png/horizontal.png'),
                path.join(__dirname, 'expected/horizontal.png'),
                path.join(__dirname, '../tmp/png/horizontal.diff.png'),
                done,
                'The horizontal sprite doesn\'t match the expected one!'
            );
        });
    });

    describe('with alternative configuration', () => {
        const stream = gulpSvgSprite(others);
        let result = 0;

        it('should produce 13 files', done => {
            stream.on('error', err => {
                assert.notEqual(err, undefined);
                done(err);
            });

            stream.on('data', file => {
                assert.notEqual(file, undefined);
                assert.notEqual(file.contents, undefined);
                writeFile(path.join(dest, file.relative), file.contents);
                ++result;
            });

            stream.on('end', () => {
                assert.equal(result, 13);
                done();
            });

            for (const file of glob.sync('weather*.svg', { cwd })) {
                stream.write(new Vinyl({
                    path: path.join(cwd, file),
                    cwd,
                    base: cwd,
                    contents: fs.readFileSync(path.join(cwd, file))
                }));
            }

            stream.end();
        });

        it('should match diagonal sprite', done => {
            compareSvg2Png(
                path.join(__dirname, '../tmp/svg/diagonal.svg'),
                path.join(__dirname, '../tmp/png/diagonal.png'),
                path.join(__dirname, 'expected/diagonal.png'),
                path.join(__dirname, '../tmp/png/diagonal.diff.png'),
                done,
                'The diagonal sprite doesn\'t match the expected one!'
            );
        });

        it('should match packed sprite', done => {
            compareSvg2Png(
                path.join(__dirname, '../tmp/svg/packed.svg'),
                path.join(__dirname, '../tmp/png/packed.png'),
                path.join(__dirname, 'expected/packed.png'),
                path.join(__dirname, '../tmp/png/packed.diff.png'),
                done,
                'The packed sprite doesn\'t match the expected one!'
            );
        });
    });
});
