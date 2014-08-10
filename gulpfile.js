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
var uglify = require('gulp-uglify');

var dependencies = require('./package.json').spm.dependencies;

// 获取包文件的路径
function getPackagePath(name, version) {
  return './sea-modules/' + name + '/' + version + '/dist/' + name + '/' + version + '/';
}

/**
 * 重命名包文件的入口文件，因为入口文件有可能为index.js
 * 统一为{package}.js
 */
function renameFile() {
  var stream = through.obj(function(file, enc, callback) {

    var filepath = file.path.split(path.sep),
      module = filepath.slice(filepath.length - 3), // => [bui-{package}, version, {main.js}]
      filename = module[0].split('-')[1];

    file.path = path.join(file.base, filename + '.js');

    return callback(null, file);
  });

  return stream;
}

//清理目录
gulp.task('clean', function() {
  return gulp.src([
      './build',
      './sea-modules'
    ], {read: false})
    .pipe(clean());
});
//获取依赖的package
gulp.task('prepare', ['clean'], function(cb){
  exec('./node_modules/spm/bin/spm install', function (err, stdout, stderr) {
    cb(stderr);
  });
});


//生成依赖包的js文件
gulp.task('package', function(){
  var files = [];
  for(var name in dependencies){
    files.push(getPackagePath(name, dependencies[name]) + '*-debug.js');
  }
  return gulp.src(files)
    // 重命名包文件的js名
    .pipe(renameFile())
    // 去掉版本号和包名
    .pipe(replace(/bui-(\w+)\/\d.\d.\d\/\w+/g, 'bui/$1'))
    // 去掉-debug的后缀
    .pipe(replace(/-debug/g, ''))
    .pipe(gulp.dest('./build'));
});

gulp.task('seed.js', ['package'], function() {
  return gulp.src([
      './sea-modules/seajs/' + dependencies.seajs + '/dist/sea-debug.js',
      './build/config.js',
      './build/common.js'
    ])
    .pipe(concat('seed.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('bui.js', ['package'], function() {
  return gulp.src([
      './sea-modules/seajs/' + dependencies.seajs + '/dist/sea-debug.js',
      './build/config.js',
      './build/common.js',
      './build/data.js',
      './build/list.js',
      './build/mask.js',
      './build/overlay.js',
      './build/picker.js',
      './build/toolbar.js',
      './build/calendar.js',
      './build/select.js',
      './build/form.js'
    ])
    .pipe(concat('bui.js'))
    .pipe(gulp.dest('./build'));
});

// 适配kissy的js
gulp.task('adapter.js', ['package'], function() {
  return gulp.src([
      './sea-modules/bui-adapter/' + dependencies['bui-adapter'] + '/dist/adapter-debug.js',
    ])
    .pipe(rename(function (path) {
        var basename = path.basename;
        path.basename = basename.replace(/-debug$/, '');
    }))
    .pipe(gulp.dest('./build'));
});

gulp.task('script', ['seed.js', 'bui.js', 'adapter.js'], function() {
  return gulp.src([
      './build/*.js'
    ])
    .pipe(uglify({
      output: {
        ascii_only: true
      }
    }))
    .pipe(rename({suffix: '-min'}))
    .pipe(gulp.dest('./build'))
});

gulp.task('css', ['package'], function() {
  // gulp.src([
  //   ])
  // .pipe('')
});

// 图片以及一些其他静态资源
gulp.task('assets', function() {
  var files = [
    '!**/*.js',
    '!**/*.css'
  ];
  for(var name in dependencies){
    files.push(getPackagePath(name, dependencies[name]) + '**/*.*');
  }
  return gulp.src(files)
    .pipe(gulp.dest('./build'))
});

gulp.task('default', ['prepare'], function() {
  return gulp.start('package', 'script', 'css', 'assets');
});

