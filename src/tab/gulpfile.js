'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('tab.js', function(){
  return gulp.src([
      'base.js',
      'panelitem.js',
      'panels.js',
      'navtabitem.js',
      'navtab.js',
      'tabitem.js',
      'tab.js',
      'tabpanelitem.js',
      'tabpanel.js'
    ]).pipe(concat('tab.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('tab.js');
});
