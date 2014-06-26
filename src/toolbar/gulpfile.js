'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('toolbar.js', function(){
  return gulp.src([
      'toolbar.js',
      'baritem.js',
      'bar.js',
      'pagingbar.js',
      'numberpagingbar.js'
    ]).pipe(concat('toolbar.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('toolbar.js');
});
