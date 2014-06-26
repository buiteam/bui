'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('layout.js', function(){
  return gulp.src([
      'base.js',
      'abstract.js',
      'collapsable.js',
      'absolute.js',
      'anchor.js',
      'columns.js',
      'flow.js',
      'table.js',
      'border.js',
      'accordion.js',
      'viewport.js',
      'item/base.js',
      'item/absolute.js',
      'item/anchor.js',
      'item/border.js',
      'item/cell.js',
      'item/tab.js'
    ]).pipe(concat('layout.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('layout.js');
});
