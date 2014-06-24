'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');

//合并js 
gulp.task('uimixins.js', function(){
  return gulp.src([
      'uibase/base.js',
      'uibase/align.js',
      'uibase/autoshow.js',
      'uibase/autohide.js',
      'uibase/close.js',
      'uibase/drag.js',
      'uibase/keynav.js',
      'uibase/mask.js',
      'uibase/position.js',
      'uibase/listitem.js',
      'uibase/stdmod.js',
      'uibase/decorate.js',
      'uibase/tpl.js',
      'uibase/collapsable.js',
      'uibase/selection.js',
      'uibase/list.js',
      'uibase/childcfg.js',
      'uibase/depends.js',
      'uibase/bindable.js'
    ]).pipe(concat('uimixins.js'))
    .pipe(gulp.dest('tmp'));
});

gulp.task('component.js', ['uimixins.js'], function(){
  return gulp.src([
      'component.js',
      'manage.js',
      'uibase.js',
      'tmp/uimixins.js',
      'view.js',
      'loader.js',
      'controller.js'
    ]).pipe(concat('component.js'))
    .pipe(gulp.dest('../../build'));
});

//清理tmp目录
gulp.task('build', ['component.js'], function() {
  return gulp.src('tmp', {read: false})
    .pipe(clean());
});

// 默认任务
gulp.task('default', function() {
  gulp.start('build');
});
