'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');

//合并js 
gulp.task('chart.js', function(){
  return gulp.src([
      'base.js',
      'mixin/actived.js',
      'mixin/activedgroup.js',
      'mixin/showlabels.js',

      'labels.js',
      'legend.js',
      'legenditem.js',
      'markers.js',
      'plotback.js',
      
      'plotitem.js',
      'plotrange.js',
      'theme.js',
      'tooltip.js',
      
      'axis/abstract.js',
      'axis/base.js',
      'axis/auto.js',
      'axis/number.js',
      'axis/grid.js',
      'axis/circle.js',
      'axis/radius.js',
      'axis/time.js',
      'axis/category.js',
      'axis.js',
      
      'series/base.js',
      'series/stacked.js',
      'series/itemgroup.js',
      'series/cartesian.js',
      'series/line.js',
      'series/area.js',
      'series/scatter.js',
      'series/bubble.js',
      'series/column.js',
      'series/pie.js',
      'series.js',

      'seriesgroup.js',
      'chart.js'
    ]).pipe(concat('chart.js'))
    .pipe(gulp.dest('../../build'));
});

// 默认任务
gulp.task('default', function() {
  gulp.start('chart.js');
});
