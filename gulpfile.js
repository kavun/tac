var gulp          = require('gulp');
var gutil         = require('gulp-util');
var pkg           = require('./package.json');
var jshint        = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var browserify    = require('gulp-browserify');
var rename        = require('gulp-rename');
var uglify        = require('gulp-uglify');
var size          = require('gulp-size');
var header        = require('gulp-header');
var bump          = require('gulp-bump');
var git           = require('gulp-git');

var banner = ['/*!',
	' * <%= pkg.name %> - <%= pkg.description %>',
	' * @author <%= pkg.author %>',
	' * @version v<%= pkg.version %>',
	' * @link <%= pkg.homepage %>',
	' * @license <%= pkg.license %>',
	' */',
	''].join('\n');

gulp.task('jshint', function () {
	gulp.src('./src/*.js')
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter(jshintStylish));
});

gulp.task('build', function () {
	gulp.src('./src/main.js')
		.pipe(browserify())
		.pipe(uglify())
		.pipe(header(banner, { pkg : pkg } ))
		.pipe(size())
		.pipe(rename(pkg.name + '.min.js'))
		.pipe(gulp.dest('./dist'))
});

gulp.task('bump', function () {
	return gulp.src(['./package.json'])
		.pipe(bump())
		.pipe(gulp.dest('./'));
});

gulp.task('tag', ['bump'], function () {
	var v = 'v' + pkg.version;
	var message = 'Release ' + v;

  	return gulp.src('./')
		.pipe(git.commit(message))
		.pipe(git.tag(v, message))
		.pipe(git.push('origin', 'master', '--tags'))
		.pipe(git.push('origin', 'gh-pages', '--tags'))
		.pipe(gulp.dest('./'));
});

gulp.task('default', ['jshint', 'build']);