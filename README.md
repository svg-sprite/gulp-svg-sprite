# gulp-svg-sprite

[![npm version][npm-image]][npm-url] [![npm downloads][npm-downloads]][npm-url] [![Build Status][ci-image]][ci-url]

is a Gulp plugin wrapping around [svg-sprite](https://github.com/svg-sprite/svg-sprite) which **takes a bunch of [SVG](https://www.w3.org/TR/SVG/) files**, optimizes them and bakes them into **SVG sprites** of several types:

* Traditional [CSS sprites](https://en.wikipedia.org/wiki/Sprite_(computer_graphics)#Sprites_by_CSS) for use as background images,
* CSS sprites with **pre-defined `<view>` elements**, useful for foreground images as well,
* inline sprites using the **`<defs>` element**,
* inline sprites using the **`<symbol>` element**
* and [SVG stacks](https://simurai.com/blog/2012/04/02/svg-stacks).


## Features & configuration? → [svg-sprite](https://github.com/svg-sprite/svg-sprite)

This document covers only gulp specific installation and configuration aspects. For a full list of features and options, please see the [svg-sprite manual](https://github.com/svg-sprite/svg-sprite).


## Usage

First, install `gulp-svg-sprite` as a development dependency:

```sh
npm install --save-dev gulp-svg-sprite
```

Then, add it to your `gulpfile.js`:

```js
const gulp = require('gulp');
const svgSprite = require('gulp-svg-sprite');

gulp.src('path/to/assets/*.svg')
  .pipe(svgSprite(/* ... Insert your configuration here ... */))
  .pipe(gulp.dest('out'));
```

**NOTICE**: By default, *svg-sprite* **doesn't send any files downstream** unless you configure it. There are tons of options available — please see below for [some basic examples](#basic-example). Also, you should possibly [take care of errors](#error-handling) that might occur.


## API


### svgSprite(options)

As `options` argument you may provide a [main configuration object](https://github.com/svg-sprite/svg-sprite/blob/main/docs/configuration.md) as described in the *svg-sprite* manual. Configuration-wise, *svg-sprite* and *gulp-svg-sprite* differ only in one respect:

#### ~~options.dest~~

Type: `String`
Default value: `'.'`

With Gulp, there is no need to specifiy a **main output directory**, as the generated files are piped to the next step of the running task anyway. The `options.dest` value (if given) is simply ignored.


## Examples


### Basic example

In this very basic example, mostly default settings will be applied to create a traditional CSS sprite (bundle of SVG sprite and CSS stylesheet).

```js
const gulp = require('gulp');
const svgSprite = require('gulp-svg-sprite');
// Basic configuration example
const config = {
  mode: {
    css: { // Activate the «css» mode
      render: {
        css: true // Activate CSS output (with default options)
      }
    }
  }
};

gulp.src('**/*.svg', { cwd: 'path/to/assets' })
  .pipe(svgSprite(config))
  .pipe(gulp.dest('out'));
```

The following files and directories are created:

```text
out/
├─ css/
│  ├─ sprite.css
│  ├─ svg/
│  │  ├─ sprite.css-495d2010.svg
```

> The cryptical looking part in the SVG's file name is the result of *svg-sprite*'s cache busting feature which is enabled by default for CSS sprites. We'll turn this off in the next example.

#### Gulp 4 basic example

```js
const { src, dest, parallel } = require('gulp');
const svgSprite = require('gulp-svg-sprite');

// Basic configuration example
const svgspriteConfig = {
  mode: {
    css: { // Activate the «css» mode
      render: {
        css: true // Activate CSS output (with default options)
      }
    }
  }
};

function buildSvg() {
  return src('**/*.svg', { cwd: 'src/assets' })
    .pipe(svgSprite(svgspriteConfig))
    .pipe(dest('out'));
}

exports.default = parallel(buildSvg);
```


### More complex example

The following example is a little more complex:

* We'll create a **«view» CSS sprite** and a **«symbol» sprite** in one go.
* Instead of CSS, we'll render a **Sass stylesheet** resource for the «view» sprite.
* We'll **turn off cache busting** for the «view» sprite and create **extra CSS rules specifying each shape's dimensions**.
* We'll **downscale the SVG shapes** to 32×32 pixels if necessary and **add 10 pixels padding** to all sides.
* We'll keep the intermediate SVG source files.

```js
const gulp = require('gulp');
const svgSprite = require('gulp-svg-sprite');
// More complex configuration example
const config = {
  shape: {
    dimension: { // Set maximum dimensions
      maxWidth: 32,
      maxHeight: 32
    },
    spacing: { // Add padding
      padding: 10
    },
    dest: 'out/intermediate-svg' // Keep the intermediate files
  },
  mode: {
    view: { // Activate the «view» mode
      bust: false,
      render: {
        scss: true // Activate Sass output (with default options)
      }
    },
    symbol: true // Activate the «symbol» mode
  }
};

gulp.src('**/*.svg', { cwd: 'path/to/assets' })
  .pipe(svgSprite(config))
  .pipe(gulp.dest('out'));
```

The following files and directories are created:

```text
out/
├─ intermediate-svg
│  ├─ weather-clear.svg
│  ├─ weather-snow.svg
│  ├─ weather-storm.svg
├─ symbol/
│  ├─ svg/
│     ├─ sprite.symbol.svg
├─ view/
│  ├─ sprite.scss
│  ├─ svg/
│     ├─ sprite.view.svg
```

### Error handling

Errors might always happen — maybe there are some corrupted source SVG files, the default [SVGO](https://github.com/svg/svgo) plugin configuration is too aggressive or there's just an error in *svg-sprite*'s code. To make your tasks more robust, you might consider using [plumber](https://github.com/floatdrop/gulp-plumber) and adding your custom error handling:

```js
const gulp = require('gulp');
const svgSprite = require('gulp-svg-sprite');
const plumber = require('gulp-plumber');

// Basic configuration example
const config = {
  mode: {
    css: {
      render: {
        css: true
      }
    }
  }
};

gulp.src('**/*.svg', { cwd: '' })
  .pipe(plumber())
  .pipe(svgSprite(config))
  .on('error', function(error) {
    /* Do some awesome error handling ... */
  })
  .pipe(gulp.dest('out'));
```


#### Advanced features

For more advanced features like

* [custom transformation](https://github.com/svg-sprite/svg-sprite/blob/main/docs/configuration.md#svg-transformations),
* [meta data injection](https://github.com/svg-sprite/svg-sprite/blob/main/docs/meta-data.md),
* [customizing output templates](https://github.com/svg-sprite/svg-sprite/blob/main/docs/templating.md) or
* introducing new output formats

please refer to the [svg-sprite manual](https://github.com/svg-sprite/svg-sprite).


## Changelog

Please refer to the [GitHub releases](https://github.com/svg-sprite/gulp-svg-sprite/releases) for a complete release history.


## Legal

Copyright © 2018 Joschi Kuphal <joschi@kuphal.net> / [@jkphl](https://twitter.com/jkphl). *svg-sprite* is licensed under the terms of the [MIT license](LICENSE). The contained example SVG icons are part of the [Tango Icon Library](http://tango.freedesktop.org/Tango_Icon_Library) and belong to the Public Domain.


[npm-url]: https://www.npmjs.com/package/gulp-svg-sprite
[npm-image]: https://img.shields.io/npm/v/gulp-svg-sprite
[npm-downloads]: https://img.shields.io/npm/dm/gulp-svg-sprite

[ci-url]: https://github.com/svg-sprite/gulp-svg-sprite/actions?query=workflow%3ATests+branch%3Amain
[ci-image]: https://img.shields.io/github/workflow/status/svg-sprite/gulp-svg-sprite/Tests/main?label=CI&logo=github
