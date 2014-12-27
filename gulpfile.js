var gulp    	= require('gulp'),
jshint			= require('gulp-jshint'),
contribs		= require('gulp-contribs');

gulp.task('lint', function () {
    gulp.src(['test/specs/**/*.js', '!test/fixtures/**', 'index.js'])
            .pipe(jshint('test/specs/.jshintrc'))
            .pipe(jshint.reporter('default'))
            .pipe(jshint.reporter('fail'))
});

gulp.task('contribs', function () {
    gulp.src('README.md')
            .pipe(contribs())
            .pipe(gulp.dest("./"))
});

gulp.task('default', ['lint']);

gulp.task("docs", function () {

    var yuidoc = require("gulp-yuidoc");

    gulp.src(["./index.js"])
        .pipe(yuidoc.parser({spaces: 4}))
        .pipe(gulp.dest("./doc"));
});