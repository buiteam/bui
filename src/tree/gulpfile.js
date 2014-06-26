'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('tree.js', function(){
  return gulp.src([
      'base.js',
      'treemixin.js',
      'selection.js',
      'treelist.js',
      'treemenu.js'
    ]).pipe(concat('tree.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('tree.js');
});
