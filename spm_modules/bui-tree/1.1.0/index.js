/**
 * @fileOverview 选择框命名空间入口文件
 * @ignore
 */

var BUI = require('bui-common'),
  Tree = BUI.namespace('Tree');

BUI.mix(Tree, {
  TreeList: require('./src/treelist'),
  Mixin: require('./src/treemixin'),
  TreeMenu: require('./src/treemenu')
});
module.exports = Tree;
