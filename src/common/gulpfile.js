'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');

//合并js 
gulp.task('uimixins.js', function(){
  return gulp.src([
      'component/uibase/base.js',
      'component/uibase/align.js',
      'component/uibase/autoshow.js',
      'component/uibase/autohide.js',
      'component/uibase/close.js',
      'component/uibase/drag.js',
      'component/uibase/keynav.js',
      'component/uibase/mask.js',
      'component/uibase/position.js',
      'component/uibase/listitem.js',
      'component/uibase/stdmod.js',
      'component/uibase/decorate.js',
      'component/uibase/tpl.js',
      'component/uibase/collapsable.js',
      'component/uibase/selection.js',
      'component/uibase/list.js',
      'component/uibase/childcfg.js',
      'component/uibase/depends.js',
      'component/uibase/bindable.js'
    ]).pipe(concat('uimixins.js'))
    .pipe(gulp.dest('tmp'));
});

gulp.task('component.js', ['uimixins.js'], function(){
  return gulp.src([
      'component/component.js',
      'component/manage.js',
      'component/uibase.js',
      'component/tmp/uimixins.js',
      'component/view.js',
      'component/loader.js',
      'component/controller.js'
    ]).pipe(concat('component.js'))
    .pipe(gulp.dest('tmp'));
});

//合并js 
gulp.task('common.js', ['component.js'], function(){
  return gulp.src([
      'common.js',
      'util.js',
      'array.js',
      'observable.js',
      'ua.js',
      'json.js',
      'keycode.js',
      'date.js',
      'base.js',
      'tmp/component.js'
    ]).pipe(concat('common.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', ['common.js'], function() {
  return gulp.src('tmp', {read: false})
    .pipe(clean());
});
