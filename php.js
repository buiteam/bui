
var gulp = require('gulp');
var path = require('path');
var http = require('http');
var Q = require('q');
var through = require('through2');
var spawn = require('child_process').spawn;


function fetch(filepath, callback){
  console.log('http://127.0.0.1:8000/' + filepath);

  http.get("http://www.baidu.com/", function(res) {
    console.log("Got response: " + res);
    callback && callback();
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
    callback && callback();
  });
}

function render(options) {
  // Creating a stream through which each file will pass
  console.log(__dirname);

  var php = spawn('php', ['-S', '127.0.0.1:8000']);

  var stream = through.obj(function(file, enc, callback) {
    fetch(path.relative(__dirname, file.path), callback)
    // return callback();
  });

  setTimeout(function(){
    php.kill();
  }, 5000);

  // returning the file stream
  return stream;
};

module.exports = render;
