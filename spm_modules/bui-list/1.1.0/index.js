/**
* @fileOverview 列表模块入口文件
* @ignore
*/
var BUI = require('bui-common'),
  List = BUI.namespace('List');

BUI.mix(List, {
  List : require('./src/list'),
  ListItem : require('./src/listitem'),
  SimpleList : require('./src/simplelist'),
  Listbox : require('./src/listbox')
});

BUI.mix(List, {
  ListItemView : List.ListItem.View,
  SimpleListView : List.SimpleList.View
});

module.exports = List;
