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

var fs						= require('fs'),
	should					= require('should'),
	path					= require('path'),
	glob					= require('glob'),
	svg2png					= require('svg2png'),
	imageDiff				= require('image-diff'),
	mkdirp					= require('mkdirp');

require('mocha');

delete require.cache[require.resolve('../')];

var gutil					= require('gulp-util'),
	gulpSvgSprite			= require('../'),
	orthogonal				= {
//		log					: 'debug',
		mode				: {
			css				: {
				layout		: 'vertical',
				sprite		: '../svg/vertical.svg',
				render		: {
					css		: true,
					scss	: true,
					less	: true,
					styl	: true
				},
				bust		: false
			},
			view			: {
				layout		: 'horizontal',
				sprite		: '../svg/horizontal.svg',
				bust		: false
			},
			defs			: {
				sprite		: '../svg/defs.svg'
			},
			symbol			: {
				sprite		: '../svg/symbol.svg'
			},
			stack			: {
				sprite		: '../svg/stack.svg'
			}
		}
	},
	others					= {
		shape				: {
			dest			: 'intermediate'
		},
		mode				: {
			css				: {
				layout		: 'diagonal',
				sprite		: '../svg/diagonal.svg',
				bust		: false
			},
			view			: {
				layout		: 'packed',
				sprite		: '../svg/packed.svg',
				bust		: false
			}
		}
	},
	cwd						= path.join(__dirname, 'fixtures'),
	dest					= path.normalize(path.join(__dirname, '..', 'tmp'));

/**
 * Prepare and output a file and create directories as necessary
 * 
 * @param {String} file				File
 * @param {String} content			Content
 * @return {String}					File
 */
function writeFile(file, content) {
	try {
		mkdirp.sync(path.dirname(file));
		fs.writeFileSync(file, content);
		return file;
	} catch(e) {
		return null;
	}
}

describe('gulp-svg-sprite', function () {
	describe('with orthogonal configuration', function () {
		var stream			= gulpSvgSprite(orthogonal),
		result				= 0;

		it('should produce 9 files', function (done) {
			this.timeout(20000);
	
			stream.on('error', function(err) {
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
	
			glob.glob.sync('weather*.svg', {cwd: cwd}).forEach(function(file){
				stream.write(new gutil.File({
					path		: path.join(cwd, file),
					cwd			: cwd,
					base		: cwd,
					contents	: fs.readFileSync(path.join(cwd, file))
				}));
			});
			
			stream.end();
		});
		
		it('should match vertical sprite', function (done) {
			this.timeout(20000);
			
			svg2png('tmp/svg/vertical.svg', 'tmp/png/vertical.png', function(error) {
				should(error).not.ok;
				
				imageDiff({
					actualImage		: 'tmp/png/vertical.png',
					expectedImage	: 'test/expected/vertical.png',
					diffImage		: 'tmp/diff/vertical.png'
				}, function(error, imagesAreSame) {
					should(error).not.ok;
					should(imagesAreSame).ok;
					done();
				});
			});
		});
		
		it('should match horizontal sprite', function (done) {
			this.timeout(20000);
			
			svg2png('tmp/svg/horizontal.svg', 'tmp/png/horizontal.png', function(error) {
				should(error).not.ok;
				
				imageDiff({
					actualImage		: 'tmp/png/horizontal.png',
					expectedImage	: 'test/expected/horizontal.png',
					diffImage		: 'tmp/diff/horizontal.png'
				}, function(error, imagesAreSame) {
					should(error).not.ok;
					should(imagesAreSame).ok;
					done();
				});
			});
		});
	});
	
	describe('with alternative configuration', function () {
		var stream			= gulpSvgSprite(others),
		result				= 0;

		it('should produce 13 files', function (done) {
			this.timeout(20000);
	
			stream.on('error', function(err) {
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
	
			glob.glob.sync('weather*.svg', {cwd: cwd}).forEach(function(file){
				stream.write(new gutil.File({
					path		: path.join(cwd, file),
					cwd			: cwd,
					base		: cwd,
					contents	: fs.readFileSync(path.join(cwd, file))
				}));
			});
			
			stream.end();
		});
		
		it('should match diagonal sprite', function (done) {
			this.timeout(20000);
			
			svg2png('tmp/svg/diagonal.svg', 'tmp/png/diagonal.png', function(error) {
				should(error).not.ok;
				
				imageDiff({
					actualImage		: 'tmp/png/diagonal.png',
					expectedImage	: 'test/expected/diagonal.png',
					diffImage		: 'tmp/diff/diagonal.png'
				}, function(error, imagesAreSame) {
					should(error).not.ok;
					should(imagesAreSame).ok;
					done();
				});
			});
		});
		
		it('should match packed sprite', function (done) {
			this.timeout(20000);
			
			svg2png('tmp/svg/packed.svg', 'tmp/png/packed.png', function(error) {
				should(error).not.ok;
				
				imageDiff({
					actualImage		: 'tmp/png/packed.png',
					expectedImage	: 'test/expected/packed.png',
					diffImage		: 'tmp/diff/packed.png'
				}, function(error, imagesAreSame) {
					should(error).not.ok;
					should(imagesAreSame).ok;
					done();
				});
			});
		});
	});
	
});
