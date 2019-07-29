'use strict';

const gulp = require('gulp');
const configPaths = require('../../config/paths.json');
const rollup = require('gulp-better-rollup');
const taskArguments = require('./task-arguments');
const gulpif = require('gulp-if');
// const uglify = require('gulp-uglify');
const eol = require('gulp-eol');
const rename = require('gulp-rename');

// Compile CSS and JS task --------------
// --------------------------------------

// check if destination flag is dist
const isDist = taskArguments.destination === 'dist' || false;

// Set the destination
const destinationPath = function() {
  // Public & Dist directories do no need namespaced with `govuk`
  if (
    taskArguments.destination === 'dist' ||
    taskArguments.destination === 'public'
  ) {
    return taskArguments.destination;
  } else {
    return `${taskArguments.destination}/govuk/`;
  }
};

const errorHandler = function(error) {
  // Log the error to the console
  console.error(error.message);

  // Ensure the task we're running exits with an error code
  this.once('finish', () => process.exit(1));
  this.emit('end');
};

// Compile js task for preview ----------
// --------------------------------------
gulp.task('js:compile', () => {
  // for dist/ folder we only want compiled 'timeout-warning-all.js' file
  let srcFiles = isDist
    ? configPaths.src + 'timeout-warning-all.js'
    : configPaths.src + '**/*.js';

  return (
    gulp
      .src([srcFiles, '!' + configPaths.src + '**/*.test.js'])
      .pipe(
        rollup({
          // Used to set the `window` global and UMD/AMD export name.
          name: 'GOVUKFrontend',
          // Legacy mode is required for IE8 support
          legacy: true,
          // UMD allows the published bundle to work in CommonJS and in the browser.
          format: 'umd'
        })
      )
      // .pipe(
      //   gulpif(
      //     isDist,
      //     uglify({
      //       ie8: true
      //     })
      //   )
      // )
      .pipe(
        gulpif(
          isDist,
          rename({
            basename: 'govuk-timeout-warning',
            extname: '.min.js'
          })
        )
      )
      .pipe(eol())
      .pipe(gulp.dest(destinationPath))
  );
});
