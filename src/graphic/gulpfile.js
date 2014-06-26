'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('graphic.js', function(){
  return gulp.src([
      'graphic.js',
      'base.js',
      'container.js',
      'canvasitem.js',
      'shape.js',
      'group.js',
      'canvas.js',
      'util.js',
      'raphael.js',
      'raphael/eve.js',
      'raphael/core.js',
      'raphael/svg.js',
      'raphael/vml.js',
      'raphael/group.js'
    ]).pipe(concat('graphic.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('graphic.js');
});
