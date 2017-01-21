var gulp = require('gulp')
    , gutil = require('gulp-util')
    , del = require('del')
    , rename = require('gulp-rename')
    , jshint = require('gulp-jshint')
    , streamify = require('gulp-streamify')
    , uglify = require('gulp-uglify')
    , connect = require('gulp-connect')
    , source = require('vinyl-source-stream')
    , babelify = require('babelify')
    , browserify = require('browserify')
    , watchify = require('watchify')
    , gulpif = require('gulp-if')
    , paths;

var watching = true;

paths = {
    js:     ['src/*.js', 'src/**/*.js'],
    entry: './src/app.js',
    dist:   './dist/'
};

gulp.task('build', null, function () {
    let bundler = watchify(browserify({
        cache: {}, packageCache: {}, fullPaths: true,
        entries: [paths.entry],
        debug: watching
    }));

    let bundlee = function() {
        return bundler
            .transform('babelify', {presets: ['babel-preset-es2015']})
            .bundle()
            .pipe(source('app.js'))
            .pipe(gulp.dest(paths.dist))
            .on('error', gutil.log);
    };

    return bundlee();
});

gulp.task('connect', function () {
    connect.server({
        root: ['./'],
        port: 9000,
        livereload: true
    });
});

gulp.task('watch', function () {
    watching = true;
    return gulp.watch(['./index.html', paths.js], ['build']);
});

gulp.task('default', ['connect', 'watch', 'build']);
