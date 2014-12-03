/**
 * @fileOverview 菜单命名空间入口文件
 * @ignore
 */

  var BUI = require('bui-common'),
    Menu = BUI.namespace('Menu');

  BUI.mix(Menu,{
    Menu : require('./src/menu'),
    MenuItem : require('./src/menuitem'),
    ContextMenu : require('./src/contextmenu'),
    PopMenu : require('./src/popmenu'),
    SideMenu : require('./src/sidemenu')
  });

  Menu.ContextMenuItem = Menu.ContextMenu.Item;

  module.exports = Menu;
