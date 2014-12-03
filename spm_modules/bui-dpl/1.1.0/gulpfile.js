'use strict';

var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var less = require('gulp-less');
var rename = require('gulp-rename');
var through = require('through2');
var path = require('path');
var exec = require('child_process').exec;
var replace = require('gulp-replace');


//清理目录
gulp.task('clean', function() {
  return gulp.src([
      './css'
    ], {read: false})
    .pipe(clean());
});


gulp.task('less', function() {
  return gulp.src([
      './src/less/*/*.less'
    ])
    .pipe(less())
    .pipe(gulp.dest('./css'));
});

gulp.task('watch', function(){
  gulp.watch('./src/**/*.less', ['less']);
});

gulp.task('css', ['less'], function() {
  // gulp.src([
  //   ])
  // .pipe('')
});

gulp.task('images', function() {
  return gulp.src([
      './src/img/*.*'
    ])
    .pipe(gulp.dest('./img'))
});

gulp.task('iconfont', function() {
  return gulp.src([
      './src/iconfont/*.*'
    ])
    .pipe(gulp.dest('./iconfont'))
});

gulp.task('default', ['clean'], function() {
  return gulp.start('less', 'images', 'iconfont');
});

