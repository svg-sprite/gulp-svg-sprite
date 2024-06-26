'use strict';

const { src, dest, parallel } = require('gulp');
const svgSprite = require('./index.js');

const svgspriteConfig = {
  mode: {
    css: {
      render: {
        css: true
      }
    }
  }
};

function buildSvg() {
  return src('test/fixtures/**/*.svg')
    .pipe(svgSprite(svgspriteConfig))
    .pipe(dest('tmp/gulp'));
}

exports.default = parallel(buildSvg);
