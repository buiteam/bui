/**
 * @fileOverview 工具栏命名空间入口
 * @ignore
 */

var BUI = require('bui-common'),
  Toolbar = BUI.namespace('Toolbar');

BUI.mix(Toolbar,{
  BarItem : require('./src/baritem'),
  Bar : require('./src/bar'),
  PagingBar : require('./src/pagingbar'),
  NumberPagingBar : require('./src/numberpagingbar')
});
module.exports = Toolbar;
