/**
 * @fileOverview 布局模块的入口文件
 * @ignore
 */

var BUI = require('bui-common');

var Layout = BUI.namespace('Layout');

BUI.mix(Layout, {
  Abstract : require('./src/abstract'),
  Anchor : require('./src/anchor'),
  Flow : require('./src/flow'),
  Absolute : require('./src/absolute'),
  Columns : require('./src/columns'),
  Table : require('./src/table'),
  Border :require('./src/border'), 
  Accordion : require('./src/accordion'),
  Viewport : require('./src/viewport')
});

module.exports = Layout;
