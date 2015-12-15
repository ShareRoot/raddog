var gulp = require('gulp');
var fs = require('fs');

var scripts = 'src/**/*.js';
var files = {
	main: 'raddog.js',
	mainMin: 'raddog.min.js',
	query: 'querydog.js',
	queryMin: 'querydog.min.js'
};
var destDir = 'dist';

var scriptsHeader = fs.readFileSync('src/header.txt', 'utf8');
var scriptsFooter = fs.readFileSync('src/footer.txt', 'utf8');

gulp.task('lint', function() {
	// Run linting on the all Javascript
	var jshint = require('gulp-jshint');
	return gulp.src(scripts)
		.pipe(jshint())
		.pipe(jshint.reporter());
});

gulp.task('scripts', ['lint'], function() {
	// Straight copy the app JavaScript and assemble the cards
	var concat = require('gulp-concat');
	var insert = require('gulp-insert');
	var uglify = require('gulp-uglify');
	return gulp.src(scripts)
		.pipe(concat(files.main))
		.pipe(insert.wrap(scriptsHeader, scriptsFooter))
		.pipe(gulp.dest(destDir))
		.pipe(uglify())
		.pipe(concat(files.mainMin))
		.pipe(gulp.dest(destDir));
});

gulp.task('build', ['scripts']);
gulp.task('test', ['build'], function(cb) {
	var exec = require('child_process').exec;
	exec('mocha', function (error, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(error);
	});
});
gulp.task('default', ['build']);
