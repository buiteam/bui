'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('common.js', function(){
  return gulp.src([
      'common.js',
      'util.js',
      'array.js',
      'observable.js',
      'ua.js',
      'json.js',
      'keycode.js',
      'date.js',
      'base.js'
    ]).pipe(concat('common.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('common.js');
});
