/**
 * @fileOverview Data 命名空间的入口文件
 * @ignore
 */
  
var BUI = require('bui-common'),
  Data = BUI.namespace('Data');

BUI.mix(Data, {
  Sortable: require('./src/sortable'),
  Proxy: require('./src/proxy'),
  AbstractStore: require('./src/abstractstore'),
  Store: require('./src/store'),
  Node: require('./src/node'),
  TreeStore: require('./src/treestore')
});

module.exports = Data;
