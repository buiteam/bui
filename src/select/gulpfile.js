'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('select.js', function(){
  return gulp.src([
      'base.js',
      'select.js',
      'tag.js',
      'combox.js',
      'suggest.js'
    ]).pipe(concat('select.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('select.js');
});
