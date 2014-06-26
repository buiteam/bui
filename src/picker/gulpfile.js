'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('picker.js', function(){
  return gulp.src([
      'base.js',
      'mixin.js',
      'picker.js',
      'listpicker.js'
    ]).pipe(concat('picker.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('picker.js');
});
