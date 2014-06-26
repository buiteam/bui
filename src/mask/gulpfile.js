'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('mask.js', function(){
  return gulp.src([
      'base.js',
      'mask.js',
      'loadMask.js'
    ]).pipe(concat('mask.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('mask.js');
});
