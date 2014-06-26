'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('list.js', function(){
  return gulp.src([
      'base.js',
      'domlist.js',
      'keynav.js',
      'sortable.js',
      'simplelist.js',
      'listbox.js',
      'listitem.js',
      'list.js'
    ]).pipe(concat('list.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('list.js');
});
