# gulp-svg-sprite [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]  [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Status][depstat-image]][depstat-url]
===============

is a [gulp](https://github.com/wearefractal/gulp) plugin wrapping around [svg-sprite](https://github.com/jkphl/svg-sprite) which **reads in a bunch of [SVG](http://www.w3.org/TR/SVG/) files**, optimizes them and creates **SVG sprites** in various flavours:

1. Traditional **CSS sprites** for use with background images ([configuration](#d-1-css-mode))
2. CSS sprites with **pre-defined SVG views**, suitable for foreground images as well ([configuration](#d-2-view-mode))
3. Inline sprites using the **`<defs>` element** ([configuration](#d-3-defs-mode))
4. Inline sprites using the **`<symbol>` element** ([configuration](#d-4-symbol-mode))
5. **SVG stacks** ([configuration](#d-5-stack-mode))

## Features & configuration? → [svg-sprite](https://github.com/jkphl/svg-sprite)

This manual covers only gulp specific installation and configuration aspects. For a full list of features and options, please see the [svg-sprite manual](https://github.com/jkphl/svg-sprite).


## Usage

First, install `gulp-svg-sprite` as a development dependency:

```shell
npm install --save-dev gulp-svg-sprite
```

Then, add it to your `gulpfile.js`:

```javascript
var gulp				= require('gulp'),
svgSprite				= require('gulp-svg-sprite');

gulp.src('assets/*.svg')
	.pipe(svgSprite())
	.pipe(gulp.dest('out'));
```

## API

### svgSprite(options)

As `options` argument you may provide a [main configuration object](https://github.com/jkphl/svg-sprite#main-configuration) as described in the *svg-sprite* manual. Configuration-wise, *svg-sprite* and *gulp-svg-sprite* differ only in one respect:

#### ~~options.dest~~

Type: `String`
Default value: `'.'`

With gulp, there is no need to specifiy a **main output directory**, as the generated files are piped to the next step of the running task anyway. The `options.dest` value (if given) is simply ignored.

## Examples

### Basic example

In this very basic example, mostly default settings will be applied to create a traditional CSS sprite (bundle of SVG sprite and CSS stylesheet).

```javascript
var gulp				= require('gulp'),
svgSprite				= require('gulp-svg-sprite'),
config					= {
	mode				: {
		css				: {		// Activate the «css» mode
			render		: {
				css		: true	// Activate CSS output (with default options)
			}
		}
	}
};

gulp.src('**/*.svg', {cwd: 'assets'})
	.pipe(svgSprite(config))
	.pipe(gulp.dest('out'));
```

The following files and directories are created:

```bash
out
`-- css
    |-- sprite.css
    `-- svg
        `-- sprite.css-495d2010.svg
```

> The cryptical looking part in the SVG's file name is the result of *svg-sprite*'s cache busting feature which is enabled by default for CSS sprites. We'll turn this off in the next example.

### More complex example

The following example is a little more complex:

* We'll create a **«view» CSS sprite** and a **«symbol» sprite** in one go.
* Instead of CSS, we'll render a **Sass stylesheet** resource for the «view» sprite.
* We'll **turn off cache busting** for the «view» sprite and create **extra CSS rules specifying each shape's dimensions**.
* We'll **downscale the SVG shapes** to 32×32 pixels if necessary and **add 10 pixels padding** to all sides.
* We'll keep the intermediate SVG source files.

```javascript
var gulp				= require('gulp'),
svgSprite				= require('gulp-svg-sprite'),
config					= {
	shape				: {
		dimension		: {			// Set maximum dimensions
			maxWidth	: 32,
			maxHeight	: 32
		},
		spacing			: {			// Add padding
			padding		: 10
		},
		dest			: 'out/intermediate-svg'	// Keep the intermediate files
	},
	mode				: {
		view			: {			// Activate the «view» mode
			bust		: false,
			render		: {
				scss	: true		// Activate Sass output (with default options)
			}
		},
		symbol			: true		// Activate the «symbol» mode
	}
};

gulp.src('**/*.svg', {cwd: 'assets'})
	.pipe(svgSprite(config))
	.pipe(gulp.dest('out'));
```

The following files and directories are created:

```javascript
out
|-- intermediate-svg
|   |-- weather-clear.svg
|   |-- weather-snow.svg
|   `-- weather-storm.svg
|-- symbol
|   `-- svg
|       `-- sprite.symbol.svg
`-- view
    |-- sprite.scss
    `-- svg
        `-- sprite.view.svg
```

### Error handling

Errors might always happen — maybe there are some corrupted source SVG files, the default [SVGO](https://github.com/svg/svgo) plugin configuration is too aggressive or there's just an error in *svg-sprite*'s code. To make your tasks more robust, you might consider using [plumber](https://github.com/floatdrop/gulp-plumber) and adding your custom error handling:

```javascript
var gulp				= require('gulp'),
svgSprite				= require('gulp-svg-sprite'),
plumber					= require('gulp-plumber'),
config					= {
	mode				: {
		css				: {
			render		: {
				css		: true
			}
		}
	}
};

gulp.src('**/*.svg', {cwd: 'assets'})
	.pipe(plumber())
	.pipe(svgSprite(config))
		.on('error', function(error){
			/* Do some awesome error handling ... */
		})
	.pipe(gulp.dest('out'));
```


### Advanced features

For more advanced features like

*	[custom transforms](https://github.com/jkphl/svg-sprite#b-2-custom-transformations-object-values),
*	[meta data injection](https://github.com/jkphl/svg-sprite#a-1-meta-data-injection),
*	customizing output templates or
*	introducing new output formats

please refer to the [svg-sprite manual](https://github.com/jkphl/svg-sprite).


## Release history

#### v1.0.2

*	Initial release, compatible with [svg-sprite 1.0.2](https://github.com/jkphl/svg-sprite/tree/v1.0.2)


## Legal

Copyright © 2014 [Joschi Kuphal](https://jkphl.is) (<joschi@kuphal.net> / [@jkphl](https://twitter.com/jkphl))

*gulp-svg-sprite* is licensed under the terms of the [MIT license](LICENSE.txt).

The contained example SVG icons are part of the [Tango Icon Library]

[npm-url]: https://npmjs.org/package/gulp-svg-sprite
[npm-image]: https://badge.fury.io/js/gulp-svg-sprite.png

[travis-url]: http://travis-ci.org/jkphl/gulp-svg-sprite
[travis-image]: https://secure.travis-ci.org/jkphl/gulp-svg-sprite.png?branch=master

[coveralls-url]: https://coveralls.io/r/jkphl/gulp-svg-sprite
[coveralls-image]: https://coveralls.io/repos/jkphl/gulp-svg-sprite/badge.png

[depstat-url]: https://david-dm.org/jkphl/gulp-svg-sprite
[depstat-image]: https://david-dm.org/jkphl/gulp-svg-sprite.png
