"use strict";

const browserify = require("browserify"),
    buffer       = require("vinyl-buffer"),
    gulp         = require("gulp"),
    path         = require("path"),
    plumber      = require('gulp-plumber'),
    source       = require("vinyl-source-stream"),
    util         = require("gulp-util"),
    watchify     = require("watchify"),
    browserSync = require('browser-sync'),
    sourcemaps = require('gulp-sourcemaps'),

    src = {
        js:     ["./src/app.js"]
    },
    dest = {
        js:     "./dist/"
    };

let bundlers;

function bundles(profile) {
    let start = new Date().getTime();

    if (bundlers === undefined) {
        let opts = {},
            presets = ["babel-preset-es2015"];

        if (profile == "prod") {
            opts.debug = false;
            presets.push("es2015");
        } else {
            opts.debug = true;
        }

        bundlers = {};

        for (let index in src.js) {
            opts.standalone = "$";

            switch (profile) {
                case "watch":
                    bundlers[src.js[index]] = watchify(browserify(src.js[index], opts)).transform("babelify", {presets: presets});
                    break;

                case "dev":
                    bundlers[src.js[index]] = browserify(src.js[index], opts).transform("babelify", {presets: presets});
                    break;

                case "prod":
                    bundlers[src.js[index]] = browserify(src.js[index], opts)
                        .transform("babelify", {presets: presets})
                        .transform({
                            global: true
                        }, "uglifyify");
                    break;
            }
        }
    }

    for (let file in bundlers) {
        bundle(file);
    }
}

function bundle(file) {
    let start = new Date().getTime(),
        _ = bundlers[file]
            .bundle()
            .on("error", util.log.bind(util, "Browserify Error"))
            .pipe(source(`${path.parse(file).name}.js`))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(dest.js)),
        time = new Date().getTime() - start;

    browserSync.reload();

    util.log("[browserify] rebundle took ", util.colors.cyan(`${time} ms`), util.colors.grey(`(${file})`));

    return _;
}

gulp.task("js:dev", bundles.bind(null, "dev"));
gulp.task("js:prod", bundles.bind(null, "prod"));


gulp.task("watch", function () {
    bundles("watch");

    for (let file in bundlers) {
        bundlers[file].on("update", bundle.bind(null, file));
    }
});

gulp.task("dev", ["js:dev"]);
gulp.task("prod", ["js:prod"]);

gulp.task("default", ["watch", "dev"], function () {
    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});


// create a task that ensures the `js` task is complete before
// reloading browsers
gulp.task('DoNotUse', ['build'], function (done) {
    browserSync.reload();
    done();
});

// use default task to launch Browsersync and watch JS files
gulp.task('Old', ['build'], function () {

    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch("src/**/*.js", ['js-watch']);
});