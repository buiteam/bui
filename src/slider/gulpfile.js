'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('slider.js', function(){
  return gulp.src([
      'base.js',
      'slider.js'
    ]).pipe(concat('slider.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('slider.js');
});
