define("bui-extensions/1.1.0/extensions/treegrid-debug", ["bui-common/1.1.0/common-debug", "jquery", "bui-tree/1.1.0/index-debug", "bui-list/1.1.0/index-debug", "bui-data/1.1.0/index-debug", "bui-grid/1.1.0/index-debug", "bui-mask/1.1.0/index-debug", "bui-toolbar/1.1.0/index-debug", "bui-menu/1.1.0/index-debug"], function(require, exports, module) {
  /**
   * @fileOverview Tree Grid
   * @ignore
   */
  var BUI = require("bui-common/1.1.0/common-debug"),
    Tree = require("bui-tree/1.1.0/index-debug"),
    Grid = require("bui-grid/1.1.0/index-debug");
  /**
   * @class BUI.Extensions.TreeGrid
   * 树型结构的表格，注意此种表格不要跟分页控件一起使用
   * @extends BUI.Grid.Grid
   */
  var TreeGrid = Grid.Grid.extend([Tree.Mixin], {}, {
    ATTRS: {
      iconContainer: {
        value: '.bui-grid-cell-inner'
      }
    }
  }, {
    xclass: 'tree-grid'
  });
  module.exports = TreeGrid;
});