'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('grid.js', function(){
  return gulp.src([
      'base.js',
      'simplegrid.js',
      'column.js',
      'header.js',
      'grid.js',
      'util.js',
      'plugins/base.js',
      'plugins/autofit.js',
      'plugins/gridmenu.js',
      'plugins/cascade.js',
      'plugins/selection.js',
      'plugins/summary.js',
      'plugins/editing.js',
      'plugins/cellediting.js',
      'plugins/rowediting.js',
      'plugins/dialog.js',
      'plugins/rownumber.js',
      'plugins/columngroup.js',
      'plugins/rowgroup.js',
      'plugins/columnresize.js'
    ]).pipe(concat('grid.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('grid.js');
});
