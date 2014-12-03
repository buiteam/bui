/**
 * @fileOverview uibase的入口文件
 * @ignore
 */
var UIBase = require('./base');

BUI.mix(UIBase, {
  Align: require('./align'),
  AutoShow: require('./autoshow'),
  AutoHide: require('./autohide'),
  Close: require('./close'),
  Collapsable: require('./collapsable'),
  Drag: require('./drag'),
  KeyNav: require('./keynav'),
  List: require('./list'),
  ListItem: require('./listitem'),
  Mask: require('./mask'),
  Position: require('./position'),
  Selection: require('./selection'),
  StdMod: require('./stdmod'),
  Decorate: require('./decorate'),
  Tpl: require('./tpl'),
  ChildCfg: require('./childcfg'),
  Bindable: require('./bindable'),
  Depends: require('./depends')
});

BUI.mix(UIBase, {
  CloseView: UIBase.Close.View,
  CollapsableView: UIBase.Collapsable.View,
  ChildList: UIBase.List.ChildList,
  /*DomList : UIBase.List.DomList,
  DomListView : UIBase.List.DomList.View,*/
  ListItemView: UIBase.ListItem.View,
  MaskView: UIBase.Mask.View,
  PositionView: UIBase.Position.View,
  StdModView: UIBase.StdMod.View,
  TplView: UIBase.Tpl.View
});

module.exports = UIBase;
