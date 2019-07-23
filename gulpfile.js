const gulp = require('gulp');
const scss = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');
const rimraf = require('gulp-rimraf');
const cssnano = require('cssnano');
const uglify = require('gulp-uglify');

// Static Assets Tasks
function copyAssetsTask() {
  return gulp.src(['html/index.html', 'json/schedule.json', 'css/reset.css'])
    .pipe(gulp.dest('dist'));
}

// SCSS Tasks
function scssTask() {
  return gulp.src('scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(scss().on('error', scss.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
}

function scssMinifyTask() {
  return gulp.src('dist/main.css')
    .pipe(cssnano())
    .dest('dist/main.min.css');
}

// JS Tasks
function jsTask() {
  return browserify({
    basedir: '.',
    debug: true,
    entries: ['ts/app.ts'],
  })
    .plugin(tsify)
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('dist'));
}

function jsMinifyTask() {
  return gulp.src('dist/app.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/app.min.js'));
}

// Watch Task
function watchTask() {
  gulp.watch([
    'ts/**/*.ts',
    'scss/**/*.scss',
    'json/schedule.json',
    'html/index.html',
  ], gulp.parallel(jsTask, scssTask, copyAssetsTask));
}

// Clean Task
function cleanTask() {
  return gulp.src('dist/**/*', { read: false })
    .pipe(rimraf());
}

/**
 * Gulp commands, usage in terminal:
 * $ gulp <command>
 * Where command is:
 * scss, js, clean, watch, production, or leave empty to run default
 */
exports.default = gulp.parallel(scssTask, jsTask, copyAssetsTask);

exports.scss = scssTask;
exports.js = jsTask;
exports.clean = cleanTask;
exports.watch = gulp.series(scssTask, jsTask, watchTask);
exports.production = gulp.parallel(
  gulp.series(scssTask, scssMinifyTask),
  gulp.series(jsTask, jsMinifyTask),
  copyAssetsTask,
);
