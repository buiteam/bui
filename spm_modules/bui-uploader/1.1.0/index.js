/**
 * @fileoverview 异步文件上传组件入口文件
 * @author 索丘 yezengyue@gmail.com
 * @ignore
 **/

var BUI = require('bui-common'),
  Uploader = BUI.namespace('Uploader');

BUI.mix(Uploader, {
  Uploader: require('./src/uploader'),
  Queue: require('./src/queue'),
  Theme: require('./src/theme'),
  Factory: require('./src/factory')
});

module.exports = Uploader;
