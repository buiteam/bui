'use strict';

var gulp = require('gulp');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

//清理目录
gulp.task('clean', function() {
  return gulp.src([
      './dist'
    ], {read: false})
    .pipe(clean());
});

gulp.task('copy', function() {
  return gulp.src([
      './adapter.js'
    ])
    .pipe(rename({suffix: '-debug'}))
    .pipe(gulp.dest('./dist'));
})

gulp.task('uglify', function() {
  return gulp.src([
      './adapter.js'
    ])
    .pipe(uglify({
      output: {
        ascii_only: true
      }
    }))
    .pipe(gulp.dest('./dist'));
})

gulp.task('default', ['clean'], function() {
  return gulp.start('copy', 'uglify');
})
