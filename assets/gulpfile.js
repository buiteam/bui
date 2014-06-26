'use strict';

var gulp = require('gulp');
var clean = require('gulp-clean');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');

gulp.task('prepare', function() {
  return gulp.src('./css/**/*.css', {read: false})
    .pipe(clean());
});

gulp.task('less', function(){
  return gulp.src([
    './css/less/base/dpl.less',
    './css/less/bui/bui.less',
    './css/less/extend/extend.less',
    './css/less/single/calendar.less',
    './css/less/single/overlay.less',
    './css/less/single/tab.less',
    './css/less/single/menu.less',
    './css/less/single/select.less',
    './css/less/single/slider.less',
    './css/less/single/grid.less',
    './css/less/single/layout.less',
    './css/less/single/imgview.less'
    ])
    .pipe(less())
    .pipe(gulp.dest('./css'));
});

gulp.task('bs3', function(){
  return gulp.src([
    './css/bs3/less/dpl.less',
    './css/bs3/less/bui.less'
    ])
    .pipe(less())
    .pipe(gulp.dest('./css/bs3'));
});


gulp.task('minify-css',['less'], function() {
  return gulp.src('./*.css')
    .pipe(minifyCSS())
    .pipe(rename({suffix: '-min'}))
    .pipe(gulp.dest('./css'));
});

gulp.task('watch', function(){
  gulp.watch('css/**/*.less', ['less', 'bs3']);
});


gulp.task('default',['prepare'], function(){
  gulp.start('less', 'bs3');
})
