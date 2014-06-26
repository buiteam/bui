'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('form.js', function(){
  return gulp.src([
      'base.js',
      'tips.js',
      'field/base.js',
      'field/text.js',
      'field/textarea.js',
      'field/number.js',
      'field/hidden.js',
      'field/readonly.js',
      'field/select.js',
      'field/date.js',
      'field/check.js',
      'field/checkbox.js',
      'field/radio.js',
      'field/plain.js',
      'field/list.js',
      'field/uploader.js',
      'field/checklist.js',
      'field/radiolist.js',
      'field.js',
      'valid.js',
      'groupvalid.js',
      'fieldcontainer.js',
      'group/base.js',
      'group/range.js',
      'group/check.js',
      'group/select.js',
      'fieldgroup.js',
      'form.js',
      'hform.js',
      'row.js',
      'rule.js',
      'rules.js',
      'remote.js'
    ]).pipe(concat('form.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('form.js');
});
