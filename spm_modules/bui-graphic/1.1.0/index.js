/**
 * @fileOverview 图形的入口文件
 * @ignore
 */

var BUI = require('bui-common'),
  Graphic = BUI.namespace('Graphic');

BUI.mix(Graphic, {
  Canvas : require('./src/canvas'),
  Group : require('./src/group'),
  Shape : require('./src/shape'),
  Util : require('./src/util')
});

module.exports = Graphic;
