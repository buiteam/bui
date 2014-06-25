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
var colorful = require('colorful');

function print(str, c){
  if(c){
    str =  colorful[c](str);
  }
  process.stdout.write(str);
}

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
        print(data);
      });
      task.stderr.on('data', function (data) {
        print(data);
      });
      task.on('close', function (code) {
        //process.stdout.write('child process exited with code ' + code);
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
  gulp.src([
    'src/adapter/adapter.js',
    'src/config.js'
    ])
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
      'src/seajs/sea.js',
      'src/config.js',
      dist + '/common.js',
      dist + '/component.js',
      dist + '/cookie.js'
    ]).pipe(concat('seed.js'))
    .pipe(gulp.dest(dist));
});

//合并bui.js
gulp.task('bui.js', ['sub'], function(){
  return gulp.src([
      'src/seajs/sea.js',
      'src/config.js',
      dist + '/common.js',
      dist + '/component.js',
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
      dist + '/tooltip.js'
    ]).pipe(concat('bui.js'))
    .pipe(gulp.dest(dist));
});


//压缩js
gulp.task('compress.js', ['seed.js', 'bui.js'], function(){
  gulp.src([
      dist + '/**/*.js'
    ])
    .pipe(rename({suffix: '-debug'}))
    .pipe(gulp.dest(dist))
    // .pipe(uglify({
    //   output: {
    //     ascii_only: true
    //   },
    //   mangle:{
    //     except: ['require']
    //   }
    //   })
    // )
    .pipe(rename(function(path){
        path.basename = path.basename.replace(/-debug$/, '');
      })
    )
    .pipe(gulp.dest(dist));
});


gulp.task('minify-css', ['sub'], function() {
  //拷贝并压缩assets目录下面的css文件
  return gulp.src([
      './assets/css/**/*.css'
    ])
    .pipe(rename({suffix: '-debug'}))
    .pipe(gulp.dest(dist + '/css'))
    .pipe(minifyCSS())
    .pipe(rename(function(path){
        path.basename = path.basename.replace(/-debug$/, '');
      })
    )
    .pipe(gulp.dest(dist + '/css'));
});

gulp.task('images', function() {
  //拷贝assets目录下面的图片文件
  gulp.src([
      './assets/img/**/*.*'
    ])
    .pipe(gulp.dest(dist + '/img'));

});


// 单元测试
function runTest() {
  // Creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, callback) {
    if (file.isNull()) {

      print("tototo start: ", 'magenta');
      print(file.relative + '\n', 'green');

      var task = spawn('totoro', ['--runner', file.path.replace(file.base, 'http://10.15.106.209/git/buiteam/bui/test/')]);
      task.stdout.on('data', function (data) {
        process.stdout.write(data);
      });
      task.stderr.on('data', function (data) {
        process.stdout.write(colorful['red'](data));
      });
      task.on('close', function (code) {
        //process.stdout.write('child process exited with code ' + code);
        callback();
      });
    }

    //return callback();
  });

  // returning the file stream
  return stream;
};

gulp.task('test', function(){
  return gulp.src([
    'test/*/*.php',
    '!test/templates/*.php'
    ], {read: false})
    .pipe(runTest())
    //.pipe(php({cwd: '.'}))
});

// 默认任务
gulp.task('default', ['prepare'], function() {
  gulp.start('copy', 'compress.js', 'minify-css', 'images');
});
