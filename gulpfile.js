const gulp         = require('gulp');
const eslint       = require('gulp-eslint');
const plumber      = require('gulp-plumber');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const watchify = require('watchify');
const util = require('gulp-util');

const DIST = 'dist/';
const SRC = 'src/';

let production = process.env.NODE_ENV === 'production';

function scripts(watch) {
    util.log(util.colors.cyan('Much script, so build, wow'));

    let bundler, rebundle;
    let start = new Date().getTime();

    bundler = browserify(SRC + 'app.js', {
        basedir: __dirname,
        debug: !production,
        cache: {}, // required for watchify
        packageCache: {}, // required for watchify
        fullPaths: watch // required to be true only for watchify
    });

    if(watch) {
        bundler = watchify(bundler, {poll: true});
        time = new Date().getTime() - start;
        util.log("[Watchify] rebundle took ", util.colors.cyan(`${time} ms`));
    }

    bundler.transform('babelify', {presets: ['babel-preset-es2015']})

    rebundle = function() {
        let stream = bundler.bundle();
        stream = stream.pipe(source('app.js'));
        return stream.pipe(gulp.dest(DIST));
    };

    bundler.on('update', rebundle);
    return rebundle();
}

gulp.task('build', function () {
    return browserify({entries: SRC + 'app.js', debug: true})
        .transform('babelify', {presets: ['babel-preset-es2015']})
        .bundle()
        .pipe(plumber())
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(DIST));
});

gulp.task('scripts', function() {
    return scripts(false);
});

gulp.task('default', function() {
    return scripts(true);
});
