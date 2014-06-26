'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('overlay.js', function(){
  return gulp.src([
      'base.js',
      'overlay.js',
      'dialog.js',
      'message.js'
    ]).pipe(concat('overlay.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('overlay.js');
});
