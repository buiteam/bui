'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('cookie.js', function(){
  return gulp.src([
      'cookie.js'
    ])
    // .pipe(concat('cookie.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('cookie.js');
});
