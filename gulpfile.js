const gulp = require('gulp');
const scss = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');
const rimraf = require('rimraf');
const cssnano = require('cssnano');
const uglify = require('gulp-uglify');
const fs = require('fs');
const connect = require('gulp-connect');

// Files to let gulp know where to start
const input = {
  scss: 'scss/main.scss',
  ts: 'ts/app.ts',
  assets: [
    'html/index.html',
    'json/schedule.json',
    'css/reset.css',
  ],
  watch: {
    ts: 'ts/**/*.ts',
    scss: 'scss/**/*.scss',
    assets: [
      'json/schedule.json',
      'html/index.html',
    ]
  }
}

// Where to ouptut the front-end site
const output = {
  dir: 'dist',
  css: 'main',
  js: 'app',
};

// Static Assets Tasks
function copyAssetsTask(cb) {
  gulp.src(input.assets)
    .pipe(gulp.dest(output.dir))
    .pipe(connect.reload());

  cb();
}

// SCSS Tasks
function scssTask(cb) {
  gulp.src(input.scss)
    .pipe(sourcemaps.init())
    .pipe(scss().on('error', scss.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(output.dir))
    .pipe(connect.reload());

  cb();
}

function scssMinifyTask(cb) {
  gulp.src(`${output.dir}/${output.css}.css`)
    .pipe(cssnano())
    .dest(`${output.dir}/${output.css}.min.css`);

  cb();
}

// JS Tasks
function jsTask(cb) {
  browserify({
    basedir: '.',
    debug: true,
    entries: [input.ts],
  })
    .plugin(tsify)
    .bundle()
    .pipe(source(`${output.js}.js`))
    .pipe(gulp.dest(output.dir))
    .pipe(connect.reload());

  cb();
}

function jsMinifyTask(cb) {
  gulp.src(`${output.dir}/${output.js}.js`)
    .pipe(uglify())
    .pipe(gulp.dest(`${output.dir}/${output.js}.min.js`));

  cb();
}

// web server with live reload
function webServerTask(cb) {
  connect.server({
    root: output.dir,
    livereload: true,
  });

  cb();
}

// Watch Task
function watchTask(cb) {
  gulp.watch(input.watch.ts, jsTask);
  gulp.watch(input.watch.scss, scssTask);
  gulp.watch(input.watch.assets, copyAssetsTask);

  cb();
}

// Clean Task
function cleanTask(cb) {
  rimraf(output.dir, cb);
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
exports.watch = gulp.series(scssTask, jsTask, copyAssetsTask, gulp.parallel(watchTask, webServerTask));
exports.production = gulp.parallel(
  gulp.series(scssTask, scssMinifyTask),
  gulp.series(jsTask, jsMinifyTask),
  copyAssetsTask,
);
