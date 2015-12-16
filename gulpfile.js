var gulp = require('gulp');
var fs = require('fs');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var uglify = require('gulp-uglify');

var scripts = {
	main: 'src/**/*.js',
	query: 'src/query.js'
}
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
	return gulp.src(scripts.main)
		.pipe(jshint())
		.pipe(jshint.reporter());
});

gulp.task('main', ['lint'], function() {
	return gulp.src(scripts.main)
		.pipe(concat(files.main))
		.pipe(insert.wrap(scriptsHeader, scriptsFooter))
		.pipe(gulp.dest(destDir))
		.pipe(uglify())
		.pipe(concat(files.mainMin))
		.pipe(gulp.dest(destDir));
});

gulp.task('query', ['main'], function() {
	return gulp.src(scripts.query)
		.pipe(insert.wrap(scriptsHeader, scriptsFooter))
		.pipe(concat(files.query))
		.pipe(gulp.dest(destDir))
		.pipe(uglify())
		.pipe(concat(files.queryMin))
		.pipe(gulp.dest(destDir));
});

gulp.task('build', ['query']);
gulp.task('test', ['build'], function() {
	var mocha = require('gulp-mocha');
	return gulp.src('test.js', {read: false}).pipe(mocha());
});
gulp.task('default', ['build']);
