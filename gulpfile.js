'use strict';

var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var n2a = require('gulp-native2ascii');
var through = require('through2');
var spawn = require('child_process').spawn;


//执行子任务
function subTask(isAnt) {
  // Creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, callback) {
    //src 必须使用{read: false}
    if (file.isNull()) {
      var task;
      if(isAnt){
        task = spawn('ant', ['-f', file.path, 'build']);
      }
      else{
        task = spawn('gulp', ['--gulpfile', file.path]);
      }
      task.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
      });
      task.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
      });
      task.on('close', function (code) {
        console.log('child process exited with code ' + code);
        callback();
      });
    }

    //return callback();
  });

  // returning the file stream
  return stream;
};

var dist = './build';


//清理build目录
gulp.task('prepare', function() {
  return gulp.src(dist, {read: false})
    .pipe(clean());
});

//
gulp.task('copy', function() {
  gulp.src(['src/common/adapter.js'])
    .pipe(gulp.dest(dist));
  gulp.src(['src/extensions/**/*.js'])
    .pipe(gulp.dest(dist + '/extensions'));
});


// ant的子任务
gulp.task('ant', function(){
  return gulp.src([
      './**/build.xml',
      //除去根目录下的gulpfile.js
      '!./build.xml'
    ], {read: false})
    .pipe(subTask(true));
})


// gulpfile的子任务
gulp.task('sub',['ant'], function () {
  return gulp.src([
      './**/gulpfile.js',
      //除去根目录下的gulpfile.js
      '!./gulpfile.js',
      //除去node_modules目录下的gulpfile.js
      '!./node_modules/**/gulpfile.js'
    ], {read: false})
    .pipe(subTask());
});


//合并js 
gulp.task('seed.js', ['sub'], function(){
  return gulp.src([
      dist + '/loader.js',
      dist + '/common.js',
      dist + '/cookie.js',
      './src/seed.js'
    ]).pipe(concat('seed.js'))
    .pipe(gulp.dest(dist));
});

//合并bui.js
gulp.task('bui.js', ['sub'], function(){
  return gulp.src([
      dist + '/loader.js',
      dist + '/common.js',
      dist + '/cookie.js',
      dist + '/data.js',
      dist + '/overlay.js',
      dist + '/list.js',
      dist + '/picker.js',
      dist + '/form.js',
      dist + '/select.js',
      dist + '/mask.js',
      dist + '/menu.js',
      dist + '/tab.js',
      dist + '/toolbar.js',
      dist + '/progressbar.js',
      dist + '/calendar.js',
      dist + '/editor.js',
      dist + '/grid.js',
      dist + '/tree.js',
      dist + '/tooltip.js',
      './src/bui.js'
    ]).pipe(concat('bui.js'))
    .pipe(gulp.dest(dist));
});


//压缩js
gulp.task('compress.js', ['seed.js', 'bui.js'], function(){
  gulp.src(dist + '/**/*.js')
    .pipe(uglify({
      output: {
        ascii_only: true
      },
      mangle:{
        except: ['require']
      }
      })
    )
    .pipe(rename({suffix: '-min'}))
    .pipe(gulp.dest(dist));
});


gulp.task('minify-css', ['sub'], function() {
  //拷贝并压缩assets目录下面的css文件
  return gulp.src([
      './assets/css/**/*.css'
    ])
    .pipe(gulp.dest(dist + '/css'))
    .pipe(minifyCSS())
    .pipe(rename({suffix: '-min'}))
    .pipe(gulp.dest(dist + '/css'));
});

gulp.task('images', function() {
  //拷贝assets目录下面的图片文件
  gulp.src([
      './assets/img/**/*.*'
    ])
    .pipe(gulp.dest(dist + '/img'));

});

// 默认任务
gulp.task('default', ['prepare'], function() {
  gulp.start('copy', 'compress.js', 'minify-css', 'images');
});
