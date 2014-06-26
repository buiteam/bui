'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('calendar.js', function(){
  return gulp.src([
      'base.js',
      'monthpicker.js',
      'header.js',
      'panel.js',
      'calendar.js',
      'datepicker.js'
    ]).pipe(concat('calendar.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('calendar.js');
});
