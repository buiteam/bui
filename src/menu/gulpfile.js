'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('menu.js', function(){
  return gulp.src([
      'base.js',
      'menuitem.js',
      'menu.js',
      'popmenu.js',
      'contextmenu.js',
      'sidemenu.js'
    ]).pipe(concat('menu.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('menu.js');
});
