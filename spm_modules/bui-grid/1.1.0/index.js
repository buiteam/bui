/**
 * @fileOverview 表格命名空间入口
 * @ignore
 */

var BUI = require('bui-common'),
  Grid = BUI.namespace('Grid');

BUI.mix(Grid, {
  SimpleGrid : require('./src/simplegrid'),
  Grid : require('./src/grid'),
  Column : require('./src/column'),
  Header : require('./src/header'),
  Format : require('./src/format'),
  Plugins : require('./src/plugins/base')
});

module.exports = Grid;
