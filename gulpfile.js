'use strict';

var gulp = require('gulp');
var clean = require('gulp-clean');
var less = require('gulp-less');
var rename = require('gulp-rename');
var through = require('through2');
var path = require('path');
var exec = require('child_process').exec;
var replace = require('gulp-replace');

var dependencies = require('./package.json').spm.dependencies;

// 获取包文件的路径
function getFiles(name, version) {
  return './sea-modules/' + name + '/' + version + '/dist/' + name + '/' + version + '/*-debug.js';
}

/**
 * 重命名包文件的入口文件，因为入口文件有可能为index.js
 * 统一为{package}.js
 */
function renamePackage() {
  var stream = through.obj(function(file, enc, callback) {

    var filepath = file.path.split(path.sep),
      module = filepath.slice(filepath.length - 3), // => [bui-{package}, version, {main.js}]
      filename = module[0].split('-')[1];

    file.path = path.join(file.base, filename + '.js');

    return callback(null, file);
  });

  return stream;
};

//清理目录
gulp.task('clean', function() {
  return gulp.src([
      './dist',
      './sea-modules'
    ], {read: false})
    .pipe(clean());
});
//获取依赖的package
gulp.task('prepare', ['clean'], function(cb){
  exec('spm install', function (err, stdout, stderr) {
    cb(stderr);
  });
});


//生成依赖包的js文件
gulp.task('package', function(){
  var files = [];
  for(var name in dependencies){
    files.push(getFiles(name, dependencies[name]));
  }
  return gulp.src(files)
    // 重命名包文件的js名
    .pipe(renamePackage())
    // 去掉版本号和包名
    .pipe(replace(/bui-(\w+)\/\d.\d.\d\/\w+/g, 'bui/$1'))
    // 去掉-debug的后缀
    .pipe(replace(/-debug/g, ''))
    .pipe(gulp.dest('./dist'));
});


gulp.task('script', function() {
  return gulp.src([
      './src/config.js'
    ])
    .pipe(gulp.dest('./dist'))
});

gulp.task('less', function() {
  return gulp.src([
      './assets/less/*/*.less'
    ])
    .pipe(less())
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('watch', function(){
  gulp.watch('./assets/**/*.less', ['less']);
});

gulp.task('css', ['less'], function() {
  // gulp.src([
  //   ])
  // .pipe('')
});

gulp.task('image', function() {
  return gulp.src([
      './assets/img/*.*'
    ])
    .pipe(gulp.dest('./dist/img'))
});

gulp.task('default', ['prepare'], function() {
  return gulp.start('package', 'script', 'css', 'image');
});

