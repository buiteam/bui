'use strict';

var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('less', function() {
  return gulp.src([
      './css/*.less'
    ])
    .pipe(less())
    .pipe(gulp.dest('./css'));
});

gulp.task('watch', function(){
  gulp.watch('./css/*.less', ['less']);
});

gulp.task('default', function() {
  return gulp.start('less');
});

