const del = require("del");
const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const plumber = require("gulp-plumber"); //keep watch
const sass = require("gulp-sass");



function browser() {
    browserSync.init({
        server: {
            baseDir: "./docs",
            reloadDebounce: 2000
        }
    })
}



function clean() {
    return del(["./docs/css/"]);
}


function css() {
    return gulp
        .src("./docs/scss/*.scss")
        .pipe(plumber())
        .pipe(sass({ outputStyle: "nested" }))
        .pipe(gulp.dest("./docs/css/"))
        .pipe(gulp.dest("./docs/css/"))
        .pipe(browserSync.stream());
}



function watchFiles() {
    gulp.watch("./docs/scss/*.scss", css).on('change', browserSync.reload);
    gulp.watch("./docs/js/*.js", css).on('change', browserSync.reload);
}


//const build = gulp.series(clean, gulp.parallel(css));
exports.default = gulp.parallel(clean, css, browser, watchFiles)
