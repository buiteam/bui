'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');

gulp.task('copy', function(){
  gulp.src([
      './plugins/ajbridge/uploader.swf'
    ])
    .pipe(gulp.dest('../../build/uploader'))
});

//合并js 
gulp.task('uploader.js', function(){
  gulp.src([
      './button/ajbridge.js',
      './button/filter.js',
      './button/base.js',
      './button/htmlButton.js',
      './button/swfButton.js',
      './type/base.js',
      './type/ajax.js',
      './type/flash.js',
      './type/iframe.js',
      './queue.js',
      './theme.js',
      './validator.js',
      './factory.js',
      './uploader.js',
      './base.js'
    ]).pipe(concat('uploader.js'))
    .pipe(gulp.dest('../../build'));
});


// 默认任务
gulp.task('default', function() {
  gulp.start('copy', 'uploader.js');
});
