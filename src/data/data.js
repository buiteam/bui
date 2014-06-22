/**
 * @fileOverview Data 命名空间的入口文件
 * @ignore
 */
(function(){
var BASE = 'bui/data/';
define('bui/data',['bui/common',BASE + 'sortable',BASE + 'proxy',BASE + 'abstractstore',BASE + 'store',
  BASE + 'node',BASE + 'treestore'],function(require) {
  
  var BUI = require('bui/common'),
    Data = BUI.namespace('Data');

  BUI.mix(Data,{
    Sortable : require(BASE + 'sortable'),
    Proxy : require(BASE + 'proxy'),
    AbstractStore : require(BASE + 'abstractstore'),
    Store : require(BASE + 'store'),
    Node : require(BASE + 'node'),
    TreeStore : require(BASE + 'treestore')
  });

  return Data;
});
})();
