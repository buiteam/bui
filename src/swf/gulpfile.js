'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('swf.js', function(){
  return gulp.src([
      'src/swf/ua.js',
      'src/swf.js'
    ]).pipe(concat('swf.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('swf.js');
});
