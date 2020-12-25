const del = require("del");
const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const plumber = require("gulp-plumber"); //keep watch
const sass = require("gulp-sass");



function browser() {
    browserSync.init({
        server: {
            baseDir: "./app",
            reloadDebounce: 2000
        }
    })
}



function clean() {
    return del(["./app/css/"]);
}


function css() {
    return gulp
        .src("./app/scss/*.scss")
        .pipe(plumber())
        .pipe(sass({ outputStyle: "nested" }))
        .pipe(gulp.dest("./app/css/"))
        .pipe(gulp.dest("./app/css/"))
        .pipe(browserSync.stream());
}



function watchFiles() {
    gulp.watch("./app/scss/*.scss", css).on('change', browserSync.reload);
    gulp.watch("./app/js/*.js", css).on('change', browserSync.reload);
}


//const build = gulp.series(clean, gulp.parallel(css));
exports.default = gulp.parallel(clean, css, browser, watchFiles)
