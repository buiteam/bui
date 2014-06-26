'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('concat', function(){
  return gulp.src([
      'data.js',
      'sortable.js',
      'proxy.js',
      'abstractstore.js',
      'node.js',
      'treestore.js',
      'store.js'
    ]).pipe(concat('data.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('concat');
});
