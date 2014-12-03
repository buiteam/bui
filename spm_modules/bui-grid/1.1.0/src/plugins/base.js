/**
 * @fileOverview 表格插件的入口
 * @author dxq613@gmail.com, yiminghe@gmail.com
 * @ignore
 */
var BUI = require('bui-common'),
  Selection = require('./selection'),

  Plugins = {};

  BUI.mix(Plugins,{
    CheckSelection : Selection.CheckSelection,
    RadioSelection : Selection.RadioSelection,
    Cascade : require('./cascade'),
    CellEditing : require('./cellediting'),
    RowEditing : require('./rowediting'),
    DialogEditing : require('./dialog'),
    AutoFit : require('./autofit'),
    GridMenu : require('./gridmenu'),
    Summary : require('./summary'),
    RowNumber : require('./rownumber'),
    ColumnGroup : require('./columngroup'),
    RowGroup : require('./rowgroup'),
    ColumnResize : require('./columnresize')
  });

module.exports = Plugins;
