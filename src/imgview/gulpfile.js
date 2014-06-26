'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('imgview.js', function(){
  return gulp.src([
      'base.js',
      'imgview.js',
      'previewlist.js',
      'viewcontent.js'
    ]).pipe(concat('imgview.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('imgview.js');
});
