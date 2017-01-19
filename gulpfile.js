const gulp         = require('gulp');
const eslint       = require('gulp-eslint');
const plumber      = require('gulp-plumber');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const browserSync = require('browser-sync');

const DIST = 'dist/';
const SRC = 'src/';

gulp.task('build', function () {
    return browserify({entries: SRC + 'app.js', debug: true})
        .transform('babelify', {presets: ['babel-preset-es2015']})
        .bundle()
        .pipe(plumber())
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(DIST));
});

// create a task that ensures the `js` task is complete before
// reloading browsers
gulp.task('js-watch', ['build'], function (done) {
    browserSync.reload();
    done();
});

// use default task to launch Browsersync and watch JS files
gulp.task('serve', ['build'], function () {

    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch("src/*.js", ['js-watch']);
});
