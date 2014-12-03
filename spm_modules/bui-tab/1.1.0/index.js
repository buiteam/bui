/**
 * @fileOverview 切换标签入口
 * @ignore
 */

var BUI = require('bui-common'),
  Tab = BUI.namespace('Tab');

BUI.mix(Tab, {
  Tab : require('./src/tab'),
  TabItem : require('./src/tabitem'),
  NavTabItem : require('./src/navtabitem'),
  NavTab : require('./src/navtab'),
  TabPanel : require('./src/tabpanel'),
  TabPanelItem : require('./src/tabpanelitem')
});

module.exports = Tab;
