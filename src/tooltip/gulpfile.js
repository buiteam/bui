'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('tooltip.js', function(){
  return gulp.src([
      'base.js',
      'tip.js',
      'tips.js'
    ]).pipe(concat('tooltip.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('tooltip.js');
});
