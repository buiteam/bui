'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('concat', function(){
  return gulp.src([
      'base.js',
      'mixin.js',
      'editor.js',
      'record.js',
      'dialog.js'
    ]).pipe(concat('editor.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('concat');
});
