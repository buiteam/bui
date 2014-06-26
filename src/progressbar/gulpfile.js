'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('progressbar.js', function(){
  return gulp.src([
      'base.js',
      'progressbar.js',
      'loadprogressbar.js'
    ]).pipe(concat('progressbar.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('progressbar.js');
});
