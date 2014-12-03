/**
 * @fileOverview 提示的入口文件
 * @ignore
 */

var BUI = require('bui-common'),
  Tooltip = BUI.namespace('Tooltip'),
  Tip = require('./src/tip'),
  Tips = require('./src/tips');

BUI.mix(Tooltip, {
  Tip: Tip,
  Tips: Tips
});

module.exports = Tooltip;
