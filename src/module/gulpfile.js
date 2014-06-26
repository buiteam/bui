'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('module.js', function(){
  return gulp.src([
      'module.js'
    ])
    // .pipe(concat('module.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('module.js');
});
